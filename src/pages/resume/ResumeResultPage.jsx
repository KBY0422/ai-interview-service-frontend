"use client";

import { Link, useLocation } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { FileText, CheckCircle2, AlertCircle, Loader2, StickyNote } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import OpenAI from "openai";
import { notoSansKR } from "../../fonts/NoToSansKR";
import { notoSansKR_black } from "../../fonts/NoToSansKR-black";
import { getPdfToken } from "../../api/api";

export default function ResumeResultPage() {
    const { state } = useLocation();
    const analysis = state?.analysis || [];
    const images = useMemo(() => state?.images ?? [], [state]);
    const [profileImage, setProfileImage] = useState(null);
    const overallScore = analysis[0]?.score || 0;
    const strengths = analysis[0]?.feedback || [];
    const improvements = analysis[0]?.improvements || [];
    const selectedFile = state?.file || null;
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pdfTokenSum, setPdfTokenSum] = useState(0);

    const client = useMemo(
        () =>
            new OpenAI({
                apiKey: process.env.REACT_APP_OPENAI_API_KEY,
                dangerouslyAllowBrowser: true,
            }),
        []
    );

    const isProfileFace = useCallback(
        async (base64Image) => {
            try {
                const response = await client.responses.create({
                    model: "gpt-4.1-mini",
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_text",
                                    text: `
이 이미지를 보고 아래 기준으로 판단해라.

판단 기준:
- 사람의 얼굴(정면 또는 증명사진 형태)이 명확히 보이면 YES
- 워터마크, 로고, 문서 배경, 아이콘, 텍스트 위주의 이미지는 NO
- 얼굴이 작게 배경처럼 포함된 경우도 NO

반드시 아래 JSON 형식으로만 답하라.

{
  "isProfileFace": true | false
}
              `.trim(),
                                },
                                {
                                    type: "input_image",
                                    image_url: `data:image/png;base64,${base64Image}`,
                                },
                            ],
                        },
                    ],
                    text: {
                        format: { type: "json_object" },
                    },
                });
                const totalToken = response.usage?.total_tokens ?? 0;
                setPdfTokenSum((prev) => prev + totalToken);
                const result = response.output_parsed ? response.output_parsed : JSON.parse(response.output[0].content[0].text);

                return result.isProfileFace === true;
            } catch (err) {
                console.error("Vision 판별 실패", err);
                return false;
            }
        },
        [client]
    );

    const pickProfileImage = useCallback(
        async (images) => {
            for (const img of images) {
                const isFace = await isProfileFace(img);
                if (isFace) {
                    return img; // 첫 번째 얼굴 사진 확정
                }
            }
            return null;
        },
        [isProfileFace]
    );

    useEffect(() => {
        const detectProfile = async () => {
            if (!images.length) return;

            const detected = await pickProfileImage(images);
            setProfileImage(detected);
        };

        detectProfile();
    }, [images, pickProfileImage]);

    function safeParseJson(raw) {
        let cleaned = raw
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("JSON 객체가 아님");
        }

        cleaned = cleaned.slice(firstBrace, lastBrace + 1);

        // ❌ 줄바꿈 강제 치환 제거
        return JSON.parse(cleaned);
    }

    const PAGE_MARGIN = 20;
    let cursorY = PAGE_MARGIN;
    function drawSectionTitle(doc, title) {
        const pageHeight = doc.internal.pageSize.height;

        if (cursorY + 15 > pageHeight - PAGE_MARGIN) {
            doc.addPage();
            cursorY = PAGE_MARGIN;
        }

        doc.setFont("NotoSansKR", "black");
        doc.setFontSize(14);
        doc.text(title, PAGE_MARGIN, cursorY);

        cursorY += 6;
        doc.setLineWidth(0.5);
        doc.line(PAGE_MARGIN, cursorY, 190, cursorY);
        cursorY += 8;
    }

    function renderJsonToPdf(data) {
        const doc = new jsPDF("p", "mm", "a4");
        cursorY = PAGE_MARGIN;
        const TABLE_BASE = {
            styles: {
                font: "NotoSansKR",
                fontStyle: "black",
                fontSize: 9,
                overflow: "linebreak",
                cellPadding: 3,
            },
            headStyles: {
                font: "NotoSansKR",
                fontStyle: "black",
                textColor: [255, 255, 255],
            },
            pageBreak: "auto",
            rowPageBreak: "auto",
        };

        /* ===============================
         기본 정보
      =============================== */
        doc.addFileToVFS("NotoSansKR-Black.ttf", notoSansKR_black);
        doc.addFileToVFS("NotoSansKR.ttf", notoSansKR);
        doc.addFont("NotoSansKR.ttf", "NotoSansKR", "normal");
        doc.addFont("NotoSansKR-Black.ttf", "NotoSansKR", "black");
        doc.setFont("NotoSansKR", "black");
        doc.setFontSize(22);
        doc.text("이 력 서", 105, cursorY, { align: "center" });
        const pageWidth = doc.internal.pageSize.getWidth();

        cursorY += 20;

        /* ===============================
   프로필 사진
=============================== */
        const headerStartY = cursorY;
        let photoHeight = 0;
        if (profileImage) {
            const PHOTO_SIZE = 60;
            photoHeight = PHOTO_SIZE;

            doc.addImage(`data:image/png;base64,${profileImage}`, "PNG", PAGE_MARGIN, headerStartY, PHOTO_SIZE, PHOTO_SIZE);
        }

        const basicInfoRows = [
            ["이름", data.기본정보?.이름],
            ["영문이름", data.기본정보?.영문이름],
            ["한문이름", data.기본정보?.한문이름],
            ["연락처", data.기본정보?.연락처],
            ["주소", data.기본정보?.주소],
            ["이메일", data.기본정보?.이메일],
        ];

        const lineHeight = 8;
        const textBlockHeight = basicInfoRows.length * lineHeight;
        let textStartY = headerStartY;
        if (profileImage) {
            textStartY = headerStartY + (photoHeight - textBlockHeight) / 2;
        }
        const RIGHT_X = pageWidth - PAGE_MARGIN;

        doc.setFontSize(12);
        cursorY = textStartY;
        const INFO_MAX_WIDTH = pageWidth / 2 - PAGE_MARGIN;

        for (const [label, value] of basicInfoRows) {
            if (value) {
                const text = `${label}: ${value}`;
                const lines = doc.splitTextToSize(text, INFO_MAX_WIDTH);

                doc.text(lines, RIGHT_X, cursorY, { align: "right", maxWidth: INFO_MAX_WIDTH });

                cursorY += lines.length * lineHeight;
            }
        }

        cursorY = headerStartY + Math.max(photoHeight, textBlockHeight) + 15;
        /* ===============================
       요약 / 핵심역량 / 기술스택 / 대외활동
    =============================== */

        const summaryRows = [];

        if (data.요약) {
            summaryRows.push(["요약", data.요약]);
        }

        if (data.핵심역량) {
            summaryRows.push(["핵심역량", data.핵심역량]);
        }

        if (data.기술스택) {
            summaryRows.push(["기술스택", data.기술스택]);
        }

        if (data.대외활동) {
            summaryRows.push(["대외활동", data.대외활동]);
        }

        if (summaryRows.length > 0) {
            drawSectionTitle(doc, "요약 및 핵심정보");

            autoTable(doc, {
                startY: cursorY,
                head: [["구분", "내용"]],
                body: summaryRows,
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 1.4,
                },
                margin: { left: 10, top: 10, right: 10 },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
                pageBreak: "auto",
                rowPageBreak: "avoid",
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }

        /* ===============================
         경력
      =============================== */
        if (Array.isArray(data.경력) && data.경력.length) {
            drawSectionTitle(doc, "경력");

            autoTable(doc, {
                startY: cursorY,
                head: [["회사명", "직무", "기간", "상세내용"]],
                body: data.경력.map((c) => [c.회사명, c.직무, c.기간, c.상세설명 || ""]),
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 1.4,
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
                pageBreak: "auto",
                rowPageBreak: "auto",
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }

        /* ===============================
         자격증
      =============================== */
        if (Array.isArray(data.자격증) && data.자격증.length) {
            drawSectionTitle(doc, "자격증");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["취득일", "자격증명", "발행기관"]],
                body: data.자격증.map((c) => [c.취득일, c.자격증명, c.발행기관]),
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 1.4,
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: "auto" },
                },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         프로젝트
      =============================== */
        if (Array.isArray(data.프로젝트) && data.프로젝트.length) {
            drawSectionTitle(doc, "프로젝트");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["기간", "프로젝트명", "담당역할", "사용기술", "설명"]],
                body: data.프로젝트.map((p) => [p.기간, p.프로젝트명, p.담당역할, p.사용기술, p.설명]),
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 1.4,
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
                margin: { left: 10, top: 10, right: 10 },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         교육이수
      =============================== */
        if (Array.isArray(data.교육이수) && data.교육이수.length) {
            drawSectionTitle(doc, "교육이수");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["기간", "교육명", "기관", "설명"]],
                body: data.교육이수.map((e) => [e.기간, e.교육명, e.기관, e.설명 || ""]),
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 1.4,
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
                margin: { left: 10, top: 10, right: 10 },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         어학
      =============================== */
        if (data.어학 && Object.values(data.어학).some((v) => v)) {
            drawSectionTitle(doc, "어학");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["외국어", "시험명", "시험점수", "토익", "토플"]],
                body: [[data.어학.외국어명, data.어학.시험명, data.어학.시험점수, data.어학.토익점수, data.어학.토플점수]],
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         병역
      =============================== */
        if (data.병역 && Object.values(data.병역).some((v) => v)) {
            drawSectionTitle(doc, "병역");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["복무기간", "병역사항", "군필여부", "보훈대상"]],
                body: [[data.병역.복무기간, data.병역.병역사항, data.병역.군필여부, data.병역.보훈대상]],
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         수상경력
      =============================== */
        if (data.수상경력?.length) {
            drawSectionTitle(doc, "수상경력");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["수상명", "발행기관", "수상일", "설명"]],
                body: data.수상경력.map((a) => [a.수상명, a.발행기관, a.수상일, a.설명]),
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         자기소개
      =============================== */
        drawSectionTitle(doc, "자기소개");

        const introRows = [];

        if (data.자기소개?.성장과정및성격) {
            introRows.push(["성장과정 및 성격", data.자기소개.성장과정및성격]);
        }

        if (data.자기소개?.내가잘할수있는일및특기) {
            introRows.push(["나의 장점 및 특기", data.자기소개.내가잘할수있는일및특기]);
        }

        if (data.자기소개?.지원동기) {
            introRows.push(["지원동기", data.자기소개.지원동기]);
        }

        if (data.자기소개?.입사후포부) {
            introRows.push(["입사 후 포부", data.자기소개.입사후포부]);
        }

        if (introRows.length > 0) {
            autoTable(doc, {
                startY: cursorY,
                head: [["구분", "내용"]],
                body: introRows,
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 1.8,
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
                margin: { left: 10, top: 10, right: 10 },
                pageBreak: "auto",
                rowPageBreak: "avoid",
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }
        /* ===============================
         기타
      =============================== */
        if (data.기타?.length) {
            drawSectionTitle(doc, "기타");

            autoTable(doc, {
                ...TABLE_BASE,
                startY: cursorY,
                head: [["구분", "내용"]],
                body: data.기타.map((e) => [e.원본섹션명, e.내용]),
                styles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 9,
                    valign: "middle",
                    halign: "center",
                    cellPadding: 3,
                    overflow: "linebreak",
                    lineHeight: 2.2,
                },
                headStyles: {
                    font: "NotoSansKR",
                    fontStyle: "black",
                    fontSize: 10,
                    textColor: [255, 255, 255],
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3,
                },
            });

            cursorY = doc.lastAutoTable.finalY + 20;
        }

        /* ===============================
         학력
      =============================== */
        drawSectionTitle(doc, "학력");

        autoTable(doc, {
            startY: cursorY,
            head: [["기간", "학교명", "학과", "졸업구분"]],
            body: data.학력.map((e) => [e.기간, e.학교명, e.학과, e.졸업구분]),
            styles: {
                font: "NotoSansKR",
                fontStyle: "black",
                fontSize: 9,
                valign: "middle",
                halign: "center",
                cellPadding: 3,
                overflow: "linebreak",
            },
            headStyles: {
                font: "NotoSansKR",
                fontStyle: "black",
                fontSize: 10,
                textColor: [255, 255, 255],
                halign: "center",
                valign: "middle",
                cellPadding: 3,
            },
            pageBreak: "auto",
        });

        /* ===============================
         저장
      =============================== */
        doc.save("resume_autotable.pdf");
    }
    const INTRO_FIELD_RULES = [
        {
            target: "성장과정및성격",
            patterns: [
                /성장\s*과정/,
                /성장\s*배경/,
                /성장.*가치관/,
                /성장.*성격/,
                /성격의\s*장단점/,
                /성격\s*및\s*가치관/,
                /성격\s*및\s*인생관/,
                /성장과정\s*및\s*장단점/,
            ],
        },
        {
            target: "내가잘할수있는일및특기",
            patterns: [/강점/, /장점/, /핵심역량/, /보유역량/, /업무\s*강점/, /직무역량/, /전문역량/, /특기/],
        },
        {
            target: "지원동기",
            patterns: [/지원\s*동기/, /지원동기/, /지원\s*이유/, /입사지원\s*동기/, /왜\s*우리\s*회사/, /회사\s*선택\s*이유/],
        },
        {
            target: "입사후포부",
            patterns: [/입사\s*후\s*포부/, /입사\s*후\s*계획/, /입사\s*후\s*목표/, /장래\s*포부/, /장래\s*목표/, /향후\s*포부/, /커리어\s*목표/],
        },
    ];

    // 2) 기타 → 자기소개 흡수 함수
    function absorbEtcIntoIntro(rawData) {
        const data = structuredClone(rawData); // 원본 안전 복사 (또는 JSON.parse(JSON.stringify(rawData)))

        if (!data.자기소개) {
            data.자기소개 = {
                성장과정및성격: "",
                내가잘할수있는일및특기: "",
                습득기술및직무역량: "",
                지원동기: "",
                입사후포부: "",
            };
        }

        if (!Array.isArray(data.기타)) {
            return data;
        }

        const remainEtc = [];

        for (const item of data.기타) {
            const name = (item.원본섹션명 || "").trim();
            const content = (item.내용 || "").trim();

            if (!name && !content) {
                continue;
            }

            let mappedKey = null;

            // 섹션명으로 매핑 규칙 찾기
            for (const rule of INTRO_FIELD_RULES) {
                if (rule.patterns.some((re) => re.test(name))) {
                    mappedKey = rule.target;
                    break;
                }
            }

            if (mappedKey) {
                const prev = data.자기소개[mappedKey] || "";
                data.자기소개[mappedKey] = prev + (prev ? "\n\n" : "") + content; // 기존 값 뒤에 이어 붙이기
            } else {
                // 매핑 안 되면 그대로 기타에 남김
                remainEtc.push(item);
            }
        }

        data.기타 = remainEtc;
        return data;
    }
    const handleNewResume = async () => {
        if (!selectedFile) return;

        if (images.length && profileImage === null) {
            alert("프로필 사진 분석 중입니다. 잠시후 다시 시도해주세요.");
            return;
        }

        setIsAnalyzing(true);

        try {
            // (1) PDF 업로드
            const uploadedFile = await client.files.create({
                file: selectedFile,
                purpose: "assistants",
            });

            // (3) 추출된 텍스트 → 표준 JSON 변환
            const jsonRes = await client.responses.create({
                model: "gpt-4.1",
                text: {
                    format: { type: "json_object" },
                },
                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text: `
[전 섹션 공통 오탈자·문장 교정 규칙]

다음 규칙은 JSON에 포함되는 모든 문자열 필드에 공통 적용한다.

[교정 허용 범위 – 모든 섹션 공통]
1. 맞춤법, 띄어쓰기, 오탈자는 반드시 수정한다.
2. 조사 누락, 어색한 어순, 비문은 자연스럽게 교정한다.
3. 동일 의미의 반복 표현은 간결하게 정리한다.
4. 구어체, 메모체, 나열식 문장은 서류용 문어체로 교정한다.

[절대 금지 사항 – 매우 중요]
1. 사실 정보 변경 금지
   - 회사명, 학교명, 기관명
   - 기간, 날짜, 숫자
   - 직무명, 자격증명, 교육명
2. 새로운 경험·성과·업무 내용 추가 금지
3. 성과 수치, 책임 범위 확대 금지
4. 원문에 존재하지 않는 해석·평가 추가 금지

[섹션별 적용 방식]

- 기본정보 / 학력 / 경력 / 자격증 / 교육이수 / 병역 / 어학
  → 의미는 그대로 두고 표현만 교정한다.
  → 단어 단위·문장 구조 단위 수정만 허용한다.

- 자기소개 / 프로젝트 설명 / 기타
  → 표현 교정 + 문단 재구성 + 강조 허용 (기존 규칙 유지)

[개선 허용 범위]
1. 맞춤법, 띄어쓰기, 오탈자 수정은 자유롭게 허용
2. 문장 순서 재배치 허용 (의미 동일 조건)
3. 중복 표현 제거 허용
4. 불필요한 구어체 → 서류용 문어체로 변환
5. 채용 담당자가 중요하게 보는 포인트가 앞에 오도록 재구성

[강조 가이드 – 중요]
- 책임감, 문제 해결, 협업, 성과, 사용자 관점, 기술 활용 능력이
  자연스럽게 드러나도록 표현을 다듬는다.
- 단, 새로운 사실을 추가하거나 경력을 과장해서는 안 된다.

[분량 규칙]
- 250자 미만 → 원문 의미를 유지하며 약 400자 내외로 확장
- 250자 이상 → 불필요한 반복 제거 + 가독성 위주로 정제
📌 [전역 섹션 인식 및 매핑 규칙 – 매우 중요]

원본 이력서에서 각 섹션의 제목은 매우 다양한 표현으로 등장할 수 있다.
GPT는 아래 규칙에 따라 최대한 많은 경우의 수를 인식하여,
반드시 JSON의 정해진 섹션으로 매핑해야 한다.

⚠️ 단, 추론·요약·재구성은 금지하며
원문 의미 그대로 구조만 분류한다.

1️⃣ 기본정보 섹션 매핑 규칙
인식 키워드 (제목 / 문맥)

기본정보

인적사항

개인정보

프로필

Personal Information

Profile

About Me

Contact Information

연락처

개인 신상

지원자 정보

내부 필드 자동 인식 규칙
JSON 필드	인식 패턴 예시
이름	이름, 성명
영문이름	영문명, English Name
한문이름	한문명,한자
생년월일	생년월일, 출생일
나이	나이, 연령
직무	지원직무, 희망직무
이메일	이메일, E-mail
연락처	연락처, 전화번호, 휴대폰
주소	주소, 거주지

👉 위 정보는 표현 개선·강조 절대 금지

2️⃣ 학력 섹션 매핑 규칙
인식 키워드

학력

학력사항

학력 이력

Education

Educational Background

학교 이력

학업 이력

필드 매핑

기간 → 재학 기간, 졸업 연도 포함

학교명 → 학교명, 대학명

학과 → 학과, 전공

졸업구분 → 졸업, 수료, 중퇴, 재학

3️⃣ 경력 섹션 매핑 규칙
인식 키워드

경력

경력사항

경력 이력

Work Experience

Employment

Career History

직무 경력

근무 이력

실무 경험

필드 매핑

회사명 → 회사명, 근무처

직무 → 담당업무, 직무

기간 → 근무기간

상세설명 → 주요 업무, 업무 내용

⚠️ 경력은 사실 변경·강조 절대 금지

4️⃣ 자격증 섹션 매핑 규칙
인식 키워드

자격증

자격

자격사항

Certificates

Certifications

License

면허

보유 자격

필드 매핑

취득일 → 취득월, 취득일

자격증명 → 자격명, 면허명

발행기관 → 발급기관, 시행기관

5️⃣ 어학 섹션 매핑 규칙
인식 키워드

어학

외국어

Language Skills

Language Proficiency

공인어학성적

영어 성적

TOEIC / TOEFL / OPIC 등

필드 매핑

외국어명 → 언어명

시험명 → 시험 종류

시험점수 → 점수

토익점수 / 토플점수 → 명시된 경우만 입력

6️⃣ 교육이수 섹션 매핑 규칙
인식 키워드

교육이수

교육

교육사항

Training

Education & Training

수강 과정

이수 과정

직무 교육

필드 매핑

기간 → 교육 기간

교육명 → 과정명

기관 → 교육기관

설명 → 수료 여부, 성과

7️⃣ 병역 섹션 매핑 규칙
인식 키워드

병역

병역사항

Military Service

군복무

군필 여부

필드 매핑

복무기간

병역사항

군필여부

보훈대상

8️⃣ 요약 / 핵심역량 / 기술스택 / 대외활동 / 수상경력 매핑 규칙 (강화 – 매우 중요)

이 섹션들은 다른 섹션(경력, 프로젝트, 자기소개)으로
흡수되거나 누락되기 쉬우므로
GPT는 반드시 아래 순서를 지켜 처리해야 한다.

[처리 우선순위 – 강제]
1. 먼저 요약 / 핵심역량 / 기술스택 / 대외활동 / 수상경력에
   해당하는 내용을 최대한 탐색한다.
2. 그 이후에 경력, 프로젝트, 자기소개로 분류한다.
3. 애매한 경우에도 절대 누락하지 말고,
   가장 근접한 항목에 우선 배치한다.

--------------------------------------------------

① 요약 (Summary / Profile Summary)

다음 중 하나라도 해당하면 반드시 "요약" 필드에 저장한다.

- 이력서 상단에 위치한 1~3문장 설명
- 지원자 전체 경력이나 강점을 한 문단으로 요약한 내용
- 다음 표현이 포함된 문장 또는 문단:
  · “○년 경력”
  · “전반적인 경험”
  · “전문 분야”
  · “주요 강점”
  · “전반적인 역량”
  · “요약”, “Summary”, “Profile”, “About Me”
- 특정 회사나 프로젝트가 아닌,
  지원자 전체를 설명하는 문단

⚠️ 규칙
- 요약은 경력/프로젝트 상세로 분해하지 않는다.
- 문단 전체를 그대로 저장한다.
- 요약이 존재하면 반드시 JSON의 "요약"에 값이 들어가야 한다.

--------------------------------------------------

② 핵심역량 (Core Competencies / Strengths)

다음에 해당하는 내용은 모두 "핵심역량"으로 저장한다.

- 불릿 포인트 또는 나열 형태의 역량 목록
- “강점”, “핵심역량”, “주요 역량”, “보유 역량”
- 문제 해결, 협업, 커뮤니케이션, 리더십, 책임감 등
  **개인 역량을 추상적으로 설명하는 표현**
- 특정 회사/프로젝트에 종속되지 않는 능력 설명

⚠️ 규칙
- 기술명(언어/도구)은 기술스택으로 보내지 않는다.
- 문장/불릿 구조를 유지한 채 저장한다.
- 애매하면 프로젝트가 아니라 핵심역량으로 우선 배치한다.

--------------------------------------------------

③ 기술스택 (Tech Stack / Skills)

다음에 해당하는 내용은 반드시 "기술스택"으로 저장한다.

- 프로그래밍 언어, 프레임워크, 라이브러리, DB, 툴 목록
- 예: Java, Spring, React, MySQL, Git, AWS 등
- “사용 기술”, “기술 스택”, “보유 기술”, “Skills”, “Tech Stack”
- 쉼표/슬래시/불릿으로 나열된 기술 목록

⚠️ 규칙
- 기술스택은 설명을 붙이지 않고 원문 구조 유지
- 프로젝트 설명 안에 있어도
  **기술 나열 부분만 분리하여 기술스택으로 저장**
- 기술명 + 설명이 섞여 있으면,
  기술명은 기술스택 / 설명은 프로젝트로 분리한다.

--------------------------------------------------

④ 대외활동 (External Activities)

다음에 해당하는 내용은 모두 "대외활동"으로 저장한다.

- 동아리, 학회, 봉사활동, 스터디, 해커톤, 세미나, 컨퍼런스
- 사내 경력이 아닌 외부 활동
- “대외활동”, “활동 이력”, “동아리”, “봉사”, “스터디”
- 수상 목적이 아닌 참여/경험 중심 활동

⚠️ 규칙
- 경력으로 절대 보내지 않는다.
- 프로젝트와 혼재된 경우,
  “활동 성격”이면 대외활동으로 분리한다.
- 기간이 없어도 내용이 있으면 저장한다.

--------------------------------------------------

⑤ 수상경력 (Awards / Achievements)

다음에 해당하는 내용은 반드시 "수상경력" 배열에 저장한다.

- 상, 대상, 최우수상, 장려상, 입상, 수료상 등
- “수상”, “Award”, “Achievement”, “입상”
- 공모전, 대회, 평가, 경진대회 결과

⚠️ 규칙
- 프로젝트/대외활동 안에 포함되어 있어도
  수상 사실은 반드시 분리하여 수상경력으로 저장한다.
- 하나의 수상 = 하나의 배열 요소
- 설명이 짧아도 절대 생략하지 않는다.

--------------------------------------------------

[최종 강제 규칙 – 매우 중요]

- 요약 / 핵심역량 / 기술스택 / 대외활동 / 수상경력에
  해당하는 내용이 원문에 존재한다면
  JSON에서 해당 필드는 **빈 값이어서는 안 된다.**
- 판단이 애매한 경우,
  기타가 아니라 이 다섯 항목 중 하나에 우선 배치한다.

9️⃣ 기타 섹션 처리 규칙 (중요)

위 모든 섹션에 명확히 매핑되지 않는 내용은 절대 버리지 말고,
반드시 다음 구조로 "기타" 배열에 저장한다.

{
  "원본섹션명": "",
  "내용": ""
}
==================================================================
[자기소개 섹션 제목 매핑 규칙 – 중요]

원본 이력서에서 자기소개 관련 섹션 제목이 다음과 같이 다양하게 등장할 수 있다.
GPT는 아래 규칙에 따라 섹션 제목을 표준 자기소개 필드에 매핑해야 한다.

1) "성장과정및성격" 필드로 매핑할 제목 패턴
   - "성장과정"
   - "성장 과정"
   - "성장 배경"
   - "성장과정 및 성격"
   - "성장과정 및 가치관"
   - "성장과정 및 장단점"
   - "성장과정 및 나의 가치관"
   - "성격의 장단점"
   - "성격 및 가치관"
   - "성격 및 인생관"
   - 제목에 "성장" 또는 "성장과정" 또는 "성장 배경" 또는 "성격" 또는 "가치관"이라는 단어가 포함되지만,
     "지원동기", "포부", "입사 후"와 같은 단어는 포함되지 않는 경우

   → 이런 제목을 가진 섹션의 내용은 모두 "자기소개.성장과정및성격"에 저장한다.

2) "내가잘할수있는일및특기" 필드로 매핑할 제목 패턴
   - "나의 강점"
   - "나의 장점"
   - "장단점"
   - "나의 장단점"
   - "내가 잘할 수 있는 일"
   - "강점 및 보완점"
   - "핵심역량"
   - "보유역량"
   - "업무 강점"
   - "직무역량"
   - "전문역량"
   - "특기 및 취미"
   - "역량 및 장점"
   - 제목에 "강점", "장점", "역량", "전문성", "특기" 등의 단어가 포함되는 경우
     (단, "지원동기", "포부", "입사 후"는 포함되지 않아야 한다)

   → 이런 제목을 가진 섹션의 내용은 모두 "자기소개.내가잘할수있는일및특기"에 저장한다.

3) "지원동기" 필드로 매핑할 제목 패턴
   - "지원동기"
   - "지원 동기"
   - "지원 이유"
   - "입사지원 동기"
   - "왜 우리 회사인가"
   - "회사 선택 이유"
   - 제목에 "지원", "지원동기", "지원 동기", "지원 이유" 등의 단어가 포함되는 경우

   → 이런 제목을 가진 섹션의 내용은 모두 "자기소개.지원동기"에 저장한다.

4) "입사후포부" 필드로 매핑할 제목 패턴
   - "입사 후 포부"
   - "입사 후 계획"
   - "입사 후 목표"
   - "입사 후 다짐"
   - "장래 포부"
   - "장래 목표"
   - "향후 포부"
   - "커리어 목표"
   - 제목에 "입사 후", "포부", "목표", "계획" 등의 단어가 포함되며
     "지원동기"와는 구분되는 경우

   → 이런 제목을 가진 섹션의 내용은 모두 "자기소개.입사후포부"에 저장한다.

5) 한 섹션 제목이 여러 의미를 동시에 포함하는 경우
   예: "지원동기 및 입사 후 포부"
   - 이 경우 GPT는 가능한 한 문단 단위로 내용을 나누어
     "지원동기"에 해당하는 문장은 "자기소개.지원동기"에,
     "입사 후 포부"에 해당하는 문장은 "자기소개.입사후포부"에 배치한다.
   - 문단을 정확히 나눌 수 없으면,
     문맥상 더 비중이 큰 쪽(예: 제목에 먼저 나오는 항목)에 배치한다.
 =================================================================    
     [프로젝트 섹션 제목 매핑 규칙 – 중요]

원본 이력서에서 프로젝트 관련 섹션 제목은 다양한 변형으로 등장할 수 있다.  
GPT는 아래 규칙에 따라 프로젝트 섹션으로 인식하여 JSON의 "프로젝트" 배열에 반드시 저장해야 한다.

1) "프로젝트" 필드로 매핑할 제목 패턴
   아래 단어가 제목에 포함될 경우 모두 "프로젝트" 항목으로 저장한다.

   - "프로젝트"
   - "Project"
   - "중간 프로젝트"
   - "최종 프로젝트"
   - "프로젝트 경험"
   - "프로젝트 이력"
   - "프로젝트 수행내역"
   - "프로젝트 경력"
   - "참여 프로젝트"
   - "주요 프로젝트"
   - "대표 프로젝트"
   - "개발 프로젝트"
   - "개발 경력"
   - "개발 경험"
   - "수행 경력"
   - "포트폴리오" (포함 시 프로젝트로 처리)
   - "작업 내역"
   - "업무 내역"
   - "담당 역할" (단독 등장 시 프로젝트와 연결된 항목으로 간주)
   - 제목에 "프로젝트", "경험", "수행", "포트폴리오", "개발" 등이 포함될 경우

   → 해당 섹션의 내용은 모두 JSON의 "프로젝트" 배열에 저장한다.

2) 하나의 제목에 여러 의미가 동시에 포함되는 경우 (예: "경력 및 프로젝트")
   - 문단 단위로 분리 가능한 경우  
       → 경력 관련 문단은 "경력" 배열로,  
          프로젝트 관련 문단은 "프로젝트" 배열로 배치한다.

   - 문단을 안전하게 구분할 수 없는 경우  
       → 제목에 먼저 등장하는 항목을 우선하여 배치한다. (예: "경력 및 프로젝트" → 경력 중심)

3) 프로젝트 항목 내부 구조 매핑 규칙
   원본 텍스트에서 다음 패턴을 자동 인식하여 값에 채운다.

   - 기간(예: "2022.01 ~ 2022.06", "2023년 3월 - 현재")
   - 프로젝트명(제목/굵은 글씨/첫 번째 줄/대제목)
   - 담당 역할(“담당”, “역할”, “포지션” 포함 문장)
   - 사용 기술(“사용 기술”, “Tech Stack”, “언어”, “프레임워크”, “DB” 포함 문장)
   - 상세 설명(나머지 서술형 문장 전체)

4) 다음과 같은 항목이 있을 경우 반드시 전체 텍스트를 누락 없이 기록하고  
   요약·재구성·생략을 절대 금지한다.

   - 문제 해결 과정
   - 개발 내용
   - 구현 기능
   - 담당 업무
   - 기술적 기여

5) 프로젝트 구조 예시 (절대 변경 금지)
   {
     "기간": "",
     "프로젝트명": "",
     "담당역할": "",
     "사용기술": "",
     "설명": ""
   }
==================================================
[최종 JSON 템플릿 – 절대 변경 금지]

{
  "기본정보": {
    "이름": "",
    "영문이름": "",
    "한문이름": "",
    "생년월일": "",
    "나이": "",
    "직무": "",
    "이메일": "",
    "연락처": "",
    "주소": "",
    "사진": ""
  },

  "요약": "",
  "핵심역량": "",
  "기술스택": "",
  "대외활동": "",
  "수상경력": [
  {
    "수상명": "",
    "발행기관": "",
    "수상일": "",
    "설명": ""
  }
],

  "학력": [
    {
      "기간": "",
      "학교명": "",
      "학과": "",
      "졸업구분": ""
    }
  ],

  "경력": [
    {
      "회사명": "",
      "직무": "",
      "기간": "",
      "상세설명": ""
    }
  ],

  "프로젝트": [
    {
      "기간": "",
      "프로젝트명": "",
      "담당역할": "",
      "사용기술": "",
      "설명": ""
    }
  ],

  "자격증": [
    {
      "취득일": "",
      "자격증명": "",
      "발행기관": ""
    }
  ],

  "어학": {
    "외국어명": "",
    "시험명": "",
    "시험점수": "",
    "토익점수": "",
    "토플점수": ""
  },

  "교육이수": [
    {
      "기간": "",
      "교육명": "",
      "기관": "",
      "설명": ""
    }
  ],

  "병역": {
    "복무기간": "",
    "병역사항": "",
    "군필여부": "",
    "보훈대상": ""
  },

  "자기소개": {
    "성장과정및성격": "",
    "내가잘할수있는일및특기": "",
    "지원동기": "",
    "입사후포부": ""
  },

  "기타": [
    {
      "원본섹션명": "",
      "내용": ""
    }
  ]
}
============================================================
[출력 형식]

- 반드시 위 JSON 템플릿을 그대로 복사해서 value만 채워서 출력할 것.
- 불필요한 텍스트 없이 JSON만 출력할 것.

============================================================
[주의]

- JSON에 없는 필드는 추가 생성 금지.
- 원본 텍스트에서 섹션명이 모호할 경우 반드시 의미 추론 없이 원문을 있는 그대로 구조에 배치한다.
- 동일한 의미로 보인다고 해서 섹션을 합치거나 분리하지 말 것.
- 날짜 포맷 변경(예: 2020.01 → 2020-01) 절대 금지.
- 줄바꿈이 포함되어 있다면 JSON 내부 문자열에서도 그대로 "\n" 형태로 보존한다.

==================================================
              `,
                            },
                            {
                                type: "input_file",
                                file_id: uploadedFile.id,
                            },
                        ],
                    },
                ],
            });

            const jsonToken = jsonRes.usage?.total_tokens ?? 0;

            const finalTokenSum = pdfTokenSum + jsonToken;
            setPdfTokenSum(finalTokenSum);

            /* 3️⃣ JSON 파싱 */
            const data = jsonRes.output_parsed ? jsonRes.output_parsed : safeParseJson(jsonRes.output[0].content[0].text);

            /* 4️⃣ 자기소개 / 기타 흡수 */
            const normalizedData = absorbEtcIntoIntro(data);

            /* 5️⃣ PDF 생성 */
            renderJsonToPdf(normalizedData);
            await getPdfToken(finalTokenSum);
        } catch (err) {
            console.error(err);
            alert("이력서 생성 중 오류 발생");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ paddingTop: "64px" }}>
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="w-full mx-auto space-y-8">
                    <div className="text-center space-y-3">
                        <FileText className="h-16 w-16 mx-auto text-primary" />
                        <h1 className="text-4xl font-bold">이력서 분석 결과</h1>
                        <p className="text-muted-foreground">AI가 분석한 당신의 이력서 평가입니다</p>
                    </div>

                    <Card className="text-center">
                        <CardContent className="pt-8 pb-8 space-y-6">
                            {/* 점수 */}
                            <div>
                                <div className="text-6xl font-bold text-primary mb-2">{overallScore}점</div>
                                <p className="text-muted-foreground">종합 점수</p>
                            </div>

                            {/* 프로그레스 */}
                            <Progress value={overallScore} className="h-3 bg-[var(--border-default)] mx-auto max-w-md" />

                            {/* 총평 */}
                            <div className="max-w-2xl mx-auto">
                                <p className="font-bold mb-2 text-left text-2xl">요약</p>
                                <ul className="space-y-2 text-lg text-left">
                                    {strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <StickyNote className="h-4 w-4 text-accent mt-0.5 flex-shrink-0 text-primary" />
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <p className="font-bold mb-2 text-left text-2xl">개선점</p>
                                <ul className="space-y-2 text-lg text-left">
                                    {improvements.map((s, i) => (
                                        <li key={i} className="flex gap-2">
                                            <AlertCircle style={{ color: "#FF6347" }} className="h-4 w-4 text-accent mt-1 flex-shrink-0 text-primary" />
                                            <span className="text-lg leading-relaxed break-words">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{analysis[1]?.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="text-2xl font-bold text-primary">{analysis[1]?.score}점</div>

                                <Progress value={analysis[1]?.score} className="h-2 bg-[var(--border-default)]" />

                                <div>
                                    <p className="font-semibold mb-1">피드백</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[1]?.feedback.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">개선점</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[1]?.improvements.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <AlertCircle style={{ color: "#FF6347" }} className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{analysis[2]?.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="text-2xl font-bold text-primary">{analysis[2]?.score}점</div>

                                <Progress value={analysis[2]?.score} className="h-2 bg-[var(--border-default)]" />

                                <div>
                                    <p className="font-semibold mb-1">피드백</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[2]?.feedback.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">개선점</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[2]?.improvements.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <AlertCircle style={{ color: "#FF6347" }} className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{analysis[3]?.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="text-2xl font-bold text-primary">{analysis[3]?.score}점</div>

                                <Progress value={analysis[3]?.score} className="h-2 bg-[var(--border-default)]" />

                                <div>
                                    <p className="font-semibold mb-1">피드백</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[3]?.feedback.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">개선점</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[3]?.improvements.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <AlertCircle style={{ color: "#FF6347" }} className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>{analysis[4]?.title}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="text-2xl font-bold text-primary">{analysis[4]?.score}점</div>

                                <Progress value={analysis[4]?.score} className="h-2 bg-[var(--border-default)]" />

                                <div>
                                    <p className="font-semibold mb-1">피드백</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[4]?.feedback.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">개선점</p>
                                    <ul className="space-y-1 text-m">
                                        {analysis[4]?.improvements.map((s, i) => (
                                            <li key={i} className="flex gap-2">
                                                <AlertCircle style={{ color: "#FF6347" }} className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                <span className="text-m leading-relaxed break-words">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex gap-4">
                        <Button className="w-full primary" disabled={!selectedFile} onClick={handleNewResume} style={{ width: "50%" }}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    보고서 생성 중... 최대 5분 정도 소요될 예정입니다.
                                </>
                            ) : (
                                "개선된 PDF 생성"
                            )}
                        </Button>

                        <Link to="/resume/upload" className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                                다시 분석하기
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
