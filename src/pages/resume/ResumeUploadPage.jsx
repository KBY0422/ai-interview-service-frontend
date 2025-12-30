"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { analyze } from "../../api/api";

export default function ResumeUploadPage() {
    const navigate = useNavigate();
    // const [imageList, setImageList] = useState([]);
    // const [pdfBase64, setPdfBase64] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!selectedFile) {
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        setIsAnalyzing(true);
        try {
            const response = await analyze(formData);
            console.log("객체 가지고왔나????", response.data);
            setTimeout(() => {
                setIsAnalyzing(false);

                navigate("/resume/result", {
                    state: {
                        analysis: response.data.analysis,
                        images: response.data.images,
                        file: selectedFile, // File 객체 전달
                    },
                });
                console.log(response.data);
            }, 3000);
        } catch (error) {
            console.log("에러발생" + error);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-page)", color: "var(--text-body)", paddingTop: "64px" }}>
            <main className="flex-1 container mx-auto px-4 py-12 bg-[var(--background)]">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-4xl font-bold text-balance">이력서 분석</h1>
                        <p className="text-lg" style={{ color: "var(--text-sub)" }}>
                            AI가 당신의 이력서를 분석하고 개선점을 제안합니다
                        </p>
                    </div>

                    <Card style={{ background: "var(--bg-card)", border: `1px solid var(--border-light)` }}>
                        <CardHeader>
                            <CardTitle>이력서 업로드</CardTitle>
                            <CardDescription>PDF 형식의 이력서를 업로드해주세요</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className="border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer"
                                style={{ borderColor: "var(--border-default)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                            >
                                {selectedFile ? (
                                    <div className="space-y-3">
                                        <FileText className="h-16 w-16 mx-auto text-primary" />
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                                            다시 선택
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-lg font-medium mb-2">PDF 파일을 드래그하거나 클릭하여 업로드</p>
                                        <p className="text-sm text-muted-foreground">최대 10MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className=""
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setSelectedFile(file);
                                    }}
                                />
                            </div>

                            <Button
                                className="w-full bg-primary primary text-lg py-6 px-4 rounded-lg font-semibold hover:brightness-110 hover:shadow-lg active:scale-95 transition-all duration-200"
                                size="lg"
                                disabled={!selectedFile || isAnalyzing}
                                onClick={handleAnalyze}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        분석 중... 최대 3분정도 소요될 예정입니다.
                                    </>
                                ) : (
                                    "이력서 분석 시작"
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card style={{ background: "var(--bg-card)", border: `1px solid var(--border-light)` }}>
                        <CardHeader>
                            <CardTitle>분석 항목</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span>이력서 구조 및 가독성</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span>경력 및 경험 분석</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span>기술 스택 평가</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span>개선 제안</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
