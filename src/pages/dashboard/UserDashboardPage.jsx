import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card2";
import { MessageSquare, FileText, TrendingUp, Trophy, Calendar, BarChart3 } from "lucide-react";
import { RadarChart, LineChart, Gauge} from "@mui/x-charts";
import { motion } from "framer-motion";
import { UserDashboard } from "../../api/api";
import Typography from "@mui/material/Typography";

// 숫자 카운팅 애니메이션 Hook
function useCounter(targetValue, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = targetValue / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        clearInterval(counter);
        setValue(targetValue);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [targetValue, duration]);

  return value;
}


function parseGptSummaryLine(line) {
  const [title, raw] = line.split(":");

  if (!raw) {
    return { title: title.trim(), items: [] };
  }

  try {
    const items = JSON.parse(raw.trim());
    return {
      title: title.trim(),
      items: Array.isArray(items) ? items : [items],
    };
  } catch (e) {
    return {
      title: title.trim(),
      items: [raw.trim()],
    };
  }
}

export default function UserDashboardPage() {
  // ===== APi 데이터=====
const [dashboard, setDashboard] = useState(null);
const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const res = await UserDashboard();
      if (res.data.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error("대시보드 조회 실패", err);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);


const summary = dashboard?.userDashBoardSummaryVO;
const interviewCount = summary?.totalInterviewCount ?? 0;
const resumeCount = summary?.totalResumeCount ?? 0;
const averageScore = summary?.averageScore ?? 0;
const bestScore = summary?.bestScore ?? 0;


const radar = dashboard?.userInterviewSkillRadarVO;
const radarMetrics = [
  "기술 점수",
  "논리 점수",
  "소프트 스킬",
  "답변 난이도",
  "답변 정확도",
];

const radarData = radar
  ? [
      radar.techScore,
      radar.logicScore,
      radar.softScore,
      radar.levelAvg,
      radar.accuracyRate,
    ]
  : [0, 0, 0, 0, 0];



const trends =
  [...(dashboard?.userRecentInterviewScoreTrendVO ?? [])].reverse();

const labels = trends.map((_, i) => {
  const diff = trends.length - 1 - i;
  return diff === 0 ? "최근" : `${diff}회 전`;
});

const scoreTrend = {
  labels,
  tech: trends.map((v) => v.techScore),
  logic: trends.map((v) => v.logicScore),
  soft: trends.map((v) => v.softScore),
  total: trends.map((v) => v.averageScore),
};

 const recentInterviews =
  dashboard?.userRecentInterviewSummaryVO?.map((v) => ({
    job: v.title,
    date: v.interviewDate.split(" ")[0],
    score: v.score,
    summary: [
      `강점: ${v.goodContent}`,
      `약점: ${v.weakContent}`,
      `피드백: ${v.feedback}`,
    ],
  })) ?? [];

const hasRecentInterviews = recentInterviews.length > 0;

    // 금액 게이지 (베타버전)
  const tokenGauge = { remaining: 12000, limit: 20000 };
  
  // 애니메이션 카운트 적용
  const animatedInterview = useCounter(interviewCount);
  const animatedResume = useCounter(resumeCount);
  const animatedAvgScore = useCounter(averageScore);
  const animatedBestScore = useCounter(bestScore);
  const animatedTokens = useCounter(tokenGauge.remaining);
 
  if (loading) {
  return <div className="p-10 text-center">로딩 중...</div>;
}
  return (
    <div className="min-h-screen bg-[var(--bg-page)] pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {/* 상단 타이틀 영역 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">나의 대시보드</h1>
          <p className="text-sm md:text-base text-[var(--text-sub)]">
            최근 면접 결과와 성장 기록을 한눈에 확인해 보세요.
          </p>
        </header>

        {/* 나의 활동 요약 섹션 타이틀 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[var(--text-main)]" />
            <h2 className="text-lg font-semibold text-[var(--text-main)]">나의 활동 요약</h2>
          </div>
        </div>

        {/* KPI + 남은 토큰 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {/* 총 면접 횟수 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.05 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow bg-[var(--bg-soft)]">
              <CardHeader className=" min-h-[60px] flex justify-between flex-row pb-2">
                <CardTitle className="text-sm text-[var(--text-main)]">총 면접 횟수</CardTitle>
                <MessageSquare className="h-5 w-5 text-[var(--text-main)] " />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[var(--text-main)]">{animatedInterview}회</p>
                <p className="text-xs text-[var(--text-sub)] mt-1">진행한 모의 면접 수</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 이력서 분석 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow bg-[var(--bg-soft)]">
              <CardHeader className="min-h-[60px] flex justify-between flex-row pb-2">
                <CardTitle className="text-sm text-[var(--text-main)]">이력서 분석</CardTitle>
                <FileText className="h-5 w-5 text-[var(--text-main)]" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[var(--text-main)]">{animatedResume}개</p>
                <p className="text-xs text-[var(--text-main)] mt-1">분석한 이력서 수</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 평균 점수 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow bg-[var(--bg-soft)]">
              <CardHeader className="min-h-[60px] flex justify-between flex-row pb-2">
                <CardTitle className="text-sm text-[var(--text-main)]">평균 점수</CardTitle>
                <TrendingUp className="h-5 w-5 text-[var(--text-main)]" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[var(--text-main)]">{animatedAvgScore}점</p>
                <p className="text-xs text-[var(--text-main)] mt-1">최근 면접 기준</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 최고 점수 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.2 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow bg-[var(--bg-soft)]">
              <CardHeader className="min-h-[60px] flex justify-between flex-row pb-2">
                <CardTitle className="text-sm text-[var(--text-main)]">최고 점수</CardTitle>
                <Trophy className="h-5 w-5 text-[var(--text-main)]" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[var(--text-main)]">{animatedBestScore}점</p>
                <p className="text-xs text-[var(--text-main)] mt-1">개인 최고 기록</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 남은 토큰 Gauge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.25}}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center bg-[var(--bg-soft)] ">
              <CardHeader className="pb-1">
                <CardTitle className="text-center text-sm text-[var(--text-main)]">
                  남은 금액(베타)
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-0 ">
                <Gauge
                  value={(animatedTokens / tokenGauge.limit) * 100}
                  valueMax={100}
                  text={`${animatedTokens.toLocaleString()} 원`}
                  width={90}
                  height={90}
                                  sx={{
                    // 'valueText' 클래스 내부의 모든 'text' 태그를 타겟팅
                            "& .MuiGauge-valueText text": {
                              fill: "var(--text-main) !important",
                            },
                            "& .MuiGauge-referenceArc": { fill: "var(--bg-softness)" },
                            "& .MuiGauge-valueArc": { fill: "var(--primary)" },
                  
                  }}
                />
                <p className="text-[11px] text-[var(--text-sub)] mt-1">
                  총 {tokenGauge.limit.toLocaleString()} 원 중
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 역량 분석 + 최근 5회 상세 점수 변화 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* RadarChart 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
          >
            <Card className="shadow-sm bg-[var(--bg-soft)] ">
              <CardHeader>
                <CardTitle className="text-[var(--text-main)] md:text-lg">역량 분석</CardTitle>
                <p className="text-xs md:text-sm text-[var(--text-main)] mt-1">
                  가장 최근 면접을 기준으로 한 기술·논리·소프트스킬 등 종합 역량 분석입니다.
                </p>
              </CardHeader>
              <CardContent className="relative flex justify-center pt-6">
                    {/* ✅ Radar 범례 (Typography) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-main)", fontSize: 12 }}
                    >
                      나의 점수
                    </Typography>
                  </div>
                <RadarChart
                  height={360}
                 series={[{ data: radarData, color: "var(--primary)" }]}
                radar={{
                  metrics: radarMetrics.map((name) => ({ name, max: 100 })),
                }}
               sx={{
                      "& text": {
                        fill: "var(--text-main)",
                        fontSize: 12,
                      },
                      "& .MuiRadarChart-grid": {
                        stroke: "var(--chart-grid)",
                      },
                      "& .MuiRadarChart-axis": {
                        stroke: "var(--chart-axis)",
                      },
                    }}
                 />
              </CardContent>
            </Card>
          </motion.div>

          {/* LineChart 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.2 }}
          >
            <Card className=" shadow-sm bg-[var(--bg-soft)] ">
              <CardHeader>
                <CardTitle className="text-[var(--text-main)] md:text-lg">
                  최근 5회 상세 점수 변화 추이
                </CardTitle>
                <p className="text-xs md:text-sm text-[var(--text-main)] mt-1">
                  면접을 거듭할수록 각 역량이 어떻게 개선되고 있는지 한 번에 확인할 수 있어요.
                </p>
              </CardHeader>
              <CardContent>
               <div className="flex flex-wrap justify-center gap-4 mb-2">
                      {[
                        { label: "기술", color: "var(--series-tech)" },
                        { label: "논리", color: "var(--series-logic)" },
                        { label: "소프트스킬", color: "var(--series-soft)" },
                        { label: "총점", color: "var(--series-total)" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-1.5 rounded-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "var(--text-main)", fontSize: 12 }}
                          >
                            {item.label}
                          </Typography>
                        </div>
                      ))}
                    </div>
                <LineChart
                  height={360}
                  xAxis={[{scaleType: "point", data: scoreTrend.labels }]}
                 series={[
                    { label: "기술", data: scoreTrend.tech, color: "var(--series-tech)", curve: "catmullRom" },
                    { label: "논리", data: scoreTrend.logic, color: "var(--series-logic)", curve: "catmullRom" },
                    { label: "소프트스킬",data: scoreTrend.soft, color: "var(--series-soft)", curve: "catmullRom" },
                    { label: "총점",data: scoreTrend.total, color: "var(--series-total)", curve: "catmullRom", lineWidth: 3 },
                  ]}
                  slotProps={{ 
                          legend: {
                          sx: {
                              display: 'none',
                            },
                          },
                        }}
                   sx={{
                  // 1. 축의 숫자 및 텍스트 (수치 부분)
                  "& .MuiChartsAxis-tickLabel": {
                    fill: "var(--text-sub) !important",
                  },
                  // SVG 특성상 tspan까지 명시적으로 잡아주는 것이 안전합니다
                  "& .MuiChartsAxis-tickLabel tspan": {
                    fill: "var(--text-sub) !important",
                  },
                  // 2. 축 선(Line) 및 틱(Tick) 마크
                  "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
                    stroke: "var(--chart-axis) !important",
                    strokeWidth: 1,
                  },
                  // 3. 배경 그리드 선
                  "& .MuiChartsGrid-line": {
                    stroke: "var(--chart-grid) !important",
                    strokeDasharray: "3 3", // 점선 스타일 (선택사항)
                  },
                  // 4. 호버 시 툴팁 내 글씨가 안 보일 경우를 대비
                  "& .MuiChartsTooltip-root .MuiChartsTooltip-label, & .MuiChartsTooltip-root .MuiChartsTooltip-value": {
                    color: "var(--text-main) !important",
                  }
                }}
                  />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 최근 면접 기록 (SaaS 스타일, 2개만 표시) */}
        <section className="mt-4">
          <div className="flex items-center gap-2 mb-1 ">
              <Calendar className="h-5 w-5 text-[var(--text-main)]" />
              <h2 className="text-lg font-semibold text-[var(--text-main)]">최근 면접 기록 & 요약</h2>
          </div>
          <span className="text-xs text-[var(--text-main)] hidden md:block mb-4">
              가장 최근 면접 2개의 요약내용과 점수를 보여줍니다.
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
             {hasRecentInterviews ? (
                 recentInterviews.slice(0, 2).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 130, damping: 18, delay: idx * 0.07 }}
              >
                <Card className=" rounded-xl shadow-sm hover:shadow-md transition bg-[var(--bg-soft)] p-5 h-full flex flex-col">
                  {/* 제목 / 날짜 / 점수 */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-base md:text-lg font-semibold text-[var(--text-main)]">
                        {item.job}
                      </p>
                      <p className="text-sm text-[var(--text-sub)] mt-1">{item.date}</p>
                    </div>

                    <div
                      className= "px-3 py-1 text-sm font-bold rounded-md"
                       style={{
                        backgroundColor:
                          item.score >= 85
                            ? "var(--score-good-bg)"
                            : "var(--score-bad-bg)",
                        color:
                          item.score >= 85
                            ? "var(--score-good-text)"
                            : "var(--score-bad-text)",
                          }}
                    >
                      {item.score}점
                    </div>
                  </div>

                  {/* GPT 요약 (2~3줄) */}
                <div className="bg-[var(--bg-softness)] border border-[var(--border-soft)] rounded-lg p-4 space-y-3 text-sm leading-relaxed text-[var(--text-main)]">
                  {item.summary.slice(0, 3).map((line, i) => {
                    const { title, items } = parseGptSummaryLine(line);

                    return (
                      <div key={i}>
                        <p className="flex items-center gap-2 font-semibold mb-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                title === "강점"
                                  ? "var(--success)"
                                  : title === "약점"
                                  ? "var(--danger)"
                                  : "var(--primary)",
                            }}
                          />
                          {title}
                        </p>

                        <ul className="pl-3 space-y-1">
                          {items.map((text, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-[var(--text-sub)]">–</span>
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                </Card>
              </motion.div>
                ))
                ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="md:col-span-1"
              >
                <Card className="rounded-xl shadow-sm bg-[var(--bg-soft)] p-6 h-full flex flex-col justify-center items-center text-center">
                  <p className="text-base font-semibold text-[var(--text-main)] mb-2">
                    아직 면접 기록이 없습니다
                  </p>
                  <p className="text-sm text-[var(--text-sub)] mb-4">
                    첫 모의 면접을 진행하면 이곳에 기록이 표시됩니다.
                  </p>
                </Card>
              </motion.div>
           )}
          </div>
        </section>
      </div>
    </div>
  );
}
