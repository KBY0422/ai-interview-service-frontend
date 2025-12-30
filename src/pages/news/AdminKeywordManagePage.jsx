import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteKeyword, insertKeyword, keywords } from "../../api/api";
import { BarChart } from "@mui/x-charts";
import { Typography } from "@mui/material";

export default function AdminKeywordManagePage() {
  const [keywordList, setKeywordList] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");

  const handleInsertKeyword = async () => {
    if (!selectedKeyword.trim()) {
      alert("키워드를 입력하세요");
      return;
    }
    if (keywordList.some((k) => k.kcontent === selectedKeyword)) {
      alert("키워드가 이미 존재합니다");
      return;
    }
    try {
      await insertKeyword(selectedKeyword);
      const listRes = await keywords();
      setKeywordList(listRes.data);
      setSelectedKeyword("");
    } catch (error) {
      console.log("키워드 추가 실패", error);
    }
  };

  const handleDeleteKeyword = async (k_content) => {
    try {
      await deleteKeyword(k_content);
      const listRes = await keywords();
      setKeywordList(listRes.data);
      setSelectedKeyword("");
    } catch (error) {
      console.log("키워드 삭제 실패", error);
    }
  };

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await keywords();
        setKeywordList(res.data);
      } catch (e) {
        console.error("키워드 조회 실패", e);
      }
    };
    fetchKeywords();
  }, []);

  const chartData = keywordList.map((k) => ({
    keyword: k.kcontent,
    count: k.kcount,
  }));
  const max = Math.max(...keywordList.map((k) => k.kcount));

  return (
    <div className="p-8">
      {/* 제목 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">키워드 관리</h1>
        <p className="text-muted-foreground">
          뉴스 검색 추천 키워드를 관리합니다
        </p>
      </div>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-12 gap-6 text-center" >
        {/* 좌측 2/3 */}
        <div className="col-span-5 space-y-6 text-center">
          {/* 키워드 추가 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-xl">
                새 키워드 추가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="space-y-2 flex flex-col items-center">
                <Input
                  id="keyword"
                  className="max-w-sm w-full"
                  placeholder="키워드를 입력하세요"
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                />
              </div>

              <Button
                className="max-w-sm w-full bg-primary primary rounded-lg font-semibold hover:brightness-110
                  active:scale-95 transition-all"
                onClick={handleInsertKeyword}
              >
                <Plus className="mr-2 h-4 w-4" />
                키워드 추가
              </Button>
            </CardContent>
          </Card>

          {/* 등록된 키워드 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-xl text-center">
                등록된 키워드 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-lg text-center">
                      키워드
                    </TableHead>
                    <TableHead className="font-bold text-lg text-center">
                      검색 횟수
                    </TableHead>
                    <TableHead className="font-bold text-lg text-center">
                      관리
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {keywordList.map((item) => (
                    <TableRow key={item.k_idx}>
                      <TableCell className="font-bold text-lg text-primary">
                        {item.kcontent}
                      </TableCell>

                      <TableCell className="font-bold text-lg text-primary">
                        {item.kcount}회
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDeleteKeyword(item.kcontent)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {keywordList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-10"
                      >
                        등록된 키워드가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* 우측 1/3 - 통계 */}
        <div className="col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-bold text-4xl">키워드 통계</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 전체 키워드 */}
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="text-xl text-muted-foreground">전체 키워드</div>
                <div className="text-3xl font-bold text-primary">
                  {keywordList.length}개
                </div>
              </div>

              {/* 총 검색 횟수 */}
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="text-xl text-muted-foreground">
                  총 검색 횟수
                </div>
                <div className="text-3xl font-bold text-primary">
                  {keywordList.reduce((s, k) => s + k.kcount, 0)}회
                </div>
              </div>

              {/* 평균 검색 수 */}
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="text-xl text-muted-foreground">
                  평균 검색 수
                </div>
                <div className="text-3xl font-bold text-primary">
                  {keywordList.length
                    ? Math.floor(
                        keywordList.reduce((s, k) => s + k.kcount, 0) /
                          keywordList.length
                      )
                    : 0}
                  회
                </div>
              </div>

              {/* 🔥 키워드 차트 */}
              <div className="p-4 bg-muted/30 rounded-lg">
               <Typography
  sx={{ color: "var(--text-main)" }}
  className="mb-2 text-center font-bold"
>
  검색 횟수
</Typography>

                <BarChart
                  height={Math.min(window.innerHeight * 0.6, 600)}
                  dataset={chartData}
                  layout="horizontal"
                  slotProps={{
                    axisLabel:{
                      style:{fill: "var(--text-main)"}
                    },
                    axisTickLabel:{
                      style:{fill:"var(--text-main)"}
                    },
                    legend: {
                    labelStyle: { fill: "var(--text-main)" },
                    },
                    tooltip: {
      sx: {
        color:"var(--text-main)",
        backgroundColor: "var(--bg-card)",
      },
    },
                  }}
                  series={[
                    {
                      dataKey: "count",
                      // label: "검색 횟수",
                      
                      // valueFormatter: (v) => `${v}회`,
                    },
                  ]}
                  yAxis={[
                    {
                      scaleType: "band",
                      dataKey: "keyword",
                      width: 120,
                    },
                  ]}
                  xAxis={[
                    {
                      min: 0,
                      colorMap: {
                        type: "piecewise",
                        thresholds: [max * 0.2, max * 0.6],
                        colors: ["#9e9e9e", "#fbc02d", "#5e35b1"],
                      },
                      valueFormatter: (v) => `${v}회`,
                    },
                    
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
