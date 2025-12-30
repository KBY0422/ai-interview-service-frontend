"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Newspaper } from "lucide-react";
import { increaseKeyword, keywords, search } from "../../api/api";
import { useSearchParams } from "react-router-dom";

export default function NewsPage() {
    const [keywordList, setKeywordList] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState("");
    const PER_PAGE = 10;
    const [allArticles, setAllArticles] = useState([]);
    const TOTAL_PAGES = Math.ceil(allArticles.length / PER_PAGE);
    const [searchParams, setSearchParams] = useSearchParams();
    const cpage = Number(searchParams.get("cpage") || 1);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                // 1️⃣ 키워드 조회
                const res = await keywords();
                console.log("KEYWORDS RAW >>>", res.data);
                const keywordData = res.data || [];
                setKeywordList(keywordData);

                if (keywordData.length === 0) return;

                let mergedItems = [];

                // 2️⃣ 키워드별로 하나씩 뉴스 가져와서 누적
                for (const k of keywordData) {
                    try {
                        const res = await search(k.kcontent, 100, 1);
                        const data = typeof res === "string" ? JSON.parse(res) : res?.data ?? res;

                        mergedItems = mergedItems.concat((data.items || []).filter((item) => item && item.link && item.title));
                    } catch (e) {
                        console.error("키워드 검색 실패:", k.kcontent, e);
                    }
                }

                // 3️⃣ 중복 제거 (link 기준)
                const uniqueItems = Array.from(new Map(mergedItems.filter((item) => item && item.link).map((item) => [item.link, item])).values());

                setAllArticles(uniqueItems);
                setArticles(uniqueItems.slice(0, PER_PAGE));
                setSelectedKeyword("");
                setInitialized(true);
            } catch (e) {
                console.error("초기 뉴스 로딩 실패", e);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [setSearchParams]);

    const handleKeywordClick = async (keyword) => {
        if (selectedKeyword === keyword) return;
        try {
            setLoading(true);
            setSelectedKeyword(keyword);

             await increaseKeyword(keyword);

            const res = await search(keyword, 100, 1);
            const data = typeof res === "string" ? JSON.parse(res) : res;

            setAllArticles(data.items || []);
            setSearchParams({ cpage: 1 });
            setArticles(data.items?.slice(0, PER_PAGE) || []);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
            console.error("뉴스 검색 실패", e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (allArticles.length === 0) return;

        const startIdx = (cpage - 1) * PER_PAGE;
        const endIdx = startIdx + PER_PAGE;

        setArticles(allArticles.slice(startIdx, endIdx));
    }, [cpage, allArticles]);

    return (
        <div className="min-h-screen flex flex-col" style={{ paddingTop: "64px" }}>
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Newspaper className="h-8 w-8 text-primary" />
                            취업 뉴스
                        </h1>
                        <p className="text-muted-foreground">최신 채용 및 취업 관련 뉴스를 확인하세요</p>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>뉴스 키워드</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2"></div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">추천 키워드</p>
                                <div className="flex flex-wrap gap-2">
                                    {keywordList.map((k) => (
                                        <Button
                                            key={k.kidx}
                                            variant={selectedKeyword === k.kcontent ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => handleKeywordClick(k.kcontent)}
                                        >
                                            {k.kcontent}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{selectedKeyword ? `"${selectedKeyword}" 뉴스` : "뉴스 목록"}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

                            {!loading && initialized && articles.length === 0 && <p className="text-sm text-muted-foreground">뉴스가 없습니다.</p>}

                            <div className="grid gap-4">
                                <p className="text-xs text-muted-foreground">총 {allArticles.length}건의 기사</p>
                                {articles
                                    .filter((item) => item && item.link)
                                    .map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-xl border bg-[var(--bg-section)] border border-[var(--border-default)] p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                                        >
                                            <h3
                                                // className="font-semibold leading-snug line-clamp-2 mb-2"
                                                className="text-lg leading-relaxed break-words text-[var(--text-main)]"
                                                dangerouslySetInnerHTML={{ __html: item.title }}
                                            />

                                            <p
                                                className="text-sm text-[var(--text-sub)] line-clamp-3 "
                                                dangerouslySetInnerHTML={{ __html: item.description }}
                                            />

                                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                                                <span className="font-medium">네이버 뉴스</span>
                                            </div>
                                        </a>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-center gap-2 mt-8">
                        <Button size="sm" variant="outline" disabled={cpage === 1} onClick={() => setSearchParams({ cpage: cpage - 1 })}>
                            이전
                        </Button>

                        {Array.from({ length: TOTAL_PAGES }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <Button
                                    key={pageNum}
                                    size="sm"
                                    variant={cpage === pageNum ? "default" : "outline"}
                                    onClick={() => setSearchParams({ cpage: pageNum })}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        <Button size="sm" variant="outline" disabled={cpage === TOTAL_PAGES} onClick={() => setSearchParams({ cpage: cpage + 1 })}>
                            다음
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
