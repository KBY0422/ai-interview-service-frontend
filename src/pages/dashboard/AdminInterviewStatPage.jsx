// src/pages/InterviewStatsPage.jsx

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card2";
import {
  MessageSquare,
  CalendarDays,
  BarChart3,
  Target,
} from "lucide-react";
import { LineChart, BarChart, PieChart} from "@mui/x-charts";

// 중앙 텍스트 스타일
import { styled } from "@mui/material/styles";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { AdminInterviewStat } from "../../api/api";

const CenterText = styled("text")(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 18,
  fontWeight: 600,
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <CenterText x={left + width / 2} y={top + height / 2}>
      {children}
    </CenterText>
  );
}

const PALETTE = [
  "#5A9BF6", "#7ED957", "#ffd062ff", "#FF7B72",
  "#C77DFF", "#4BC0C0", "#9966FF", "#FF6384",
]; 

// 숫자 카운트 애니메이션
function useCounter(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setValue(target);
      } else setValue(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [target,duration]);
  return value;
}

export default function InterviewStatsPage() {
   const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
  
     useEffect(() => {
      const loadDashboard = async () => {
        try {
          const res = await AdminInterviewStat();
          if (res.data.success) {
            setDashboard(res.data.data);
            console.log("dashboard raw:", res.data.data);
            console.log("cardStat:", res.data.data?.cardStat);
          }
        } catch (err) {
          console.error("대시보드 조회 실패", err);
        } finally {
          setLoading(false);
        }
      };
    
      loadDashboard();
    }, []);

   
// dashboard?.card?.totalUserCount ?? 0;
  // ===== 샘플 통계 데이터 =====
  const todayInterviews =dashboard?.cardStat?.todayInterviewCount ?? 0 ;
  const weekInterviews = dashboard?.cardStat?.weekInterviewCount ?? 0 ;
  const monthInterviews = dashboard?.cardStat?.monthInterviewCount ?? 0 ;
  const avgScore = dashboard?.cardStat?.averageScore ?? 0 ;

const last7DaysInterviews =
  dashboard?.dailyInterviewCountList?.map(d => d.count) ?? [];

const last7DaysLabels =
  dashboard?.dailyInterviewCountList?.map(d =>
    d.date.slice(8) + "일"
  ) ?? [];

const monthlyInterviews =
  dashboard?.monthlyTrendList?.map(m => m.interviewCount) ?? [];

  const monthlyLabels =
  dashboard?.monthlyTrendList?.map(m =>
    m.monthLabel.slice(5) + "월"
  ) ?? [];

      // ===== 복합 파이 + 바 데이터 =====
          const jobData = useMemo(
          () => dashboard?.jobRatioList ?? [],
          [dashboard]
        );

        const skillData = useMemo(
          () => dashboard?.jobSkillRatioList ?? [],
          [dashboard]
        );
   const [selectedJob, setSelectedJob] = useState("");

useEffect(() => {
  if (dashboard?.jobRatioList?.length > 0) {
    setSelectedJob(dashboard.jobRatioList[0].job);
  }
}, [dashboard]);


// 직무별 색상 배열
const colors = useMemo(
          () => jobData.map((_, i) => PALETTE[i % PALETTE.length]),
          [jobData]
        );

// 직무 → 색상 매핑
const jobColorMap = useMemo(() => {
  const map = {};
  jobData.forEach((j, i) => {
    map[j.job] = colors[i];
  });
  return map;
}, [jobData, colors]);

// 선택 직무의 기술 목록
const skillByJob = useMemo(
  () => skillData.filter(s => s.job === selectedJob),
  [skillData, selectedJob]
);

 const innerData = useMemo(
          () =>
            jobData.map((j, i) => ({
              id: j.job,
              label: j.job,
              value: j.count,
              color: jobColorMap[j.job], // 여기서 색상을 직접 지정
            })),
          [jobData, jobColorMap]
        );

//=======================================================================
// 면접 유형(인성,기술,종합)
  const typeData = 
  dashboard?.interviewTypeRatioList?.map((item,jdx)=>({
        id : jdx,
        value : item.count,
        label : item.interviewType
  })) ?? [] ;
  
  
  //  난이도 및 전체 평균점수
const difficultyTrend =
  dashboard?.dailyAvgDifficultyList?.map(d => d.avgDifficulty) ?? [];

const avgScoreTrend =
  dashboard?.dailyAvgScoreList?.map(d => d.avgScore) ?? [];

  // ===== 애니메이션 숫자 =====
  const animToday = useCounter(todayInterviews);
  const animWeek = useCounter(weekInterviews);
  const animMonth = useCounter(monthInterviews);
  const animScore = useCounter(avgScore);
 
    
if (loading) {
  return <div className="p-10">대시보드 로딩 중...</div>;
}

  return (


    <div className="min-h-screen bg-[#f5f5fb]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* 타이틀 */}
        <h1 className="text-3xl font-bold mb-2">면접 통계</h1>
        <p className="text-muted-foreground mb-5">
          면접 이용 현황과 난이도/점수 변화를 분석합니다.
        </p>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="오늘의 면접" value={`${animToday}회`} desc="오늘 진행된 면접" icon={<MessageSquare />} />
          <StatCard title="이번주 면접" value={`${animWeek}회`} desc="7일간 총 면접" icon={<CalendarDays />} />
          <StatCard title="이번달 면접" value={`${animMonth}회`} desc="월간 총 면접" icon={<BarChart3 />} />
          <StatCard title="평균 점수" value={`${animScore}점`} desc="전체 평균 점수" icon={<Target />} />
        </div>

           {/* 복합 (파이 + 기술 바) */}
       {/* Row 2: 직종 + 기술스택 (Full Width) */}
<div className="grid grid-cols-1 mt-6">
  <ChartBlock title="직종 및 기술스택 분포" description="최근 3개월 데이터를 기준으로 집계된 통계입니다.">
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

      {/* 좌측: 직종 Pie */}
      <div className="flex justify-center">
        <PieChart
          height={320}
          series={[
            {
              innerRadius: 50,
              outerRadius: 120,
              data: innerData,
              arcLabel: (item) => item.label,
              paddingAngle: 4,
              cornerRadius: 4,
            },
          ]}
        >
          {innerData.length > 0 && <PieCenterLabel>직종</PieCenterLabel>}
        </PieChart>
      </div>

      {/* 우측: 기술 Bar */}
      <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
              {/* 선택 직무 배지 */}
              <span
                className="px-2 py-0.5 ml-12 text-xs rounded-full font-semibold text-black "
                style={{ backgroundColor: jobColorMap[selectedJob] ?? "#5A9BF6" }}
              >
                {selectedJob} 
              </span>
               기술스택 TOP
            </div>

          <select
            className="
                  px-3 py-2
                  text-sm
                  border border-gray-300
                  rounded-lg
                  bg-white
                  shadow-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-1
                  focus:ring-blue-400
                  transition
                "
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            {jobData.map((j) => (
              <option key={j.job} value={j.job}>
                {j.job}
              </option>
            ))}
          </select>
        </div>

        <BarChart
          height={280}
          xAxis={[{ scaleType: "band", data: skillByJob.map((s) => s.skill) }]}
          series={[
            {
              data: skillByJob.map((s) => s.count),
              color: jobColorMap[selectedJob] ?? "#5A9BF6",
            },
          ]}
        />
      </div>

    </div>
  </ChartBlock>
</div>

{/* Row 3: (2개 한 줄) 면접 유형 분포 + 월별 면접 수 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

  <ChartBlock title="면접 유형 분포" description="최근 3개월 데이터를 기준으로 집계된 통계입니다.">
    <PieChart
      height={320}
      series={[
        {
          data: typeData,
          innerRadius: 50,
          outerRadius: 120,
          paddingAngle: 4,
          cornerRadius: 4,
        },
      ]}
    />
  </ChartBlock>

  <ChartBlock title="월별 면접 수" description="이번년도에 집계된 통계입니다.">
    <BarChart
      height={320}
      xAxis={[{ scaleType: "band", data: monthlyLabels }]}
      series={[{ data: monthlyInterviews, color: "#d19affff" }]}
    />
  </ChartBlock>

</div>

{/* Row 4: (3개 한 줄) 최근7일 + 난이도 + 점수 */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

  <ChartBlock title="최근 7일간 면접 수 변화">
    <LineChart
      height={260}
      xAxis={[{ scaleType: "point", data: last7DaysLabels }]}
      series={[
        { data: last7DaysInterviews, label: "면접 수", curve: "catmullRom" },
      ]}
    />
  </ChartBlock>

  <ChartBlock title="사용자의 평균 질문 난이도 변화 (1~5)">
    <LineChart
      height={260}
      xAxis={[{ scaleType: "point", data: last7DaysLabels }]}
      series={[
        {
          data: difficultyTrend,
          label: "평균 난이도",
          color: "#a658ffff",
          curve: "catmullRom",
        },
      ]}
    />
  </ChartBlock>

  <ChartBlock title="사용자의 평균 점수 변화">
    <LineChart
      height={260}
      xAxis={[{ scaleType: "point", data: last7DaysLabels }]}
      series={[
        {
          data: avgScoreTrend,
          label: "평균 점수",
          color: "#0077ffff",
          curve: "catmullRom",
        },
      ]}
    />
  </ChartBlock>

</div>


      </div>
    </div>
  );
}

/* ===========================
   공통 컴포넌트
=========================== */

function StatCard({ title, value, desc, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="h-32 shadow-sm ">
        <CardHeader className="flex justify-between pb-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChartBlock({ title, description,children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
