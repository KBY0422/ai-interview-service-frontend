// src/pages/AdminDashboardPage.jsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card2";

import {
  BadgeDollarSign,
  Briefcase,
  Code2,
  Search,
  Users,
  MessagesSquare,
  Paperclip,
} from "lucide-react";

import { LineChart } from "@mui/x-charts";
import { AdminDashboard } from "../../api/api";

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

export default function AdminDashboardPage() {
  
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await AdminDashboard();
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

  // ===== 샘플 데이터 (나중에 Spring API 연동) =====
const totalUsers = dashboard?.card?.totalUserCount ?? 0;
const todayInterview = dashboard?.card?.todayInterview ?? 0;
const todayResume = dashboard?.card?.todayResume ?? 0;
const todayRevenue = dashboard?.card?.todayRevenue ?? 0;


  // 최근 7일 사용 추세
 // 최근 7일 매출 추세 (면접 매출, 이력서 매출, 총매출)
const last7Days =
  dashboard?.revenueTrend7Days?.map((d) => ({
    day: d.date.slice(8) + "일",        // "01-10" → "01-10일"
    interviewRevenue: d.interviewRevenue,
    resumeRevenue: d.resumeRevenue,
    totalRevenue: d.totalRevenue,
  })) ?? [];

  // TOP 3 데이터
const topJobs =
  dashboard?.topJobs?.map((item, idx) => ({
    rank: idx + 1,
    label: item.label ?? item.job ?? item.jobName,
    count: item.count ?? item.total ?? item.cnt,
  })) ?? [];
const topStacks =
  dashboard?.topSkills?.map((item, idx) => ({
    rank: idx + 1,
    label: item.label ?? item.skill,
    count: item.count ?? item.total,
  })) ?? [];
const topKeywords =
  dashboard?.topKeywords?.map((item, idx) => ({
    rank: idx + 1,
    label: item.label ?? item.keyword,
    count: item.count ?? item.total,
  })) ?? [];

  // ===== 애니메이션 적용 숫자 =====
  const animTotalUsers = useCounter(totalUsers, 900);
  const animTodayInterview = useCounter(todayInterview, 900);
  const animTodayResume = useCounter(todayResume, 900);
  const animRevenue = useCounter(todayRevenue, 900);

  if (loading) {
  return <div className="p-10">대시보드 로딩 중...</div>;
}
  return (
    <div className="bg-[#f5f5fb]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            오늘의 지표, 최근 매출 추세, 인기 직무/기술/검색어를 확인해 보세요.
          </p>
        </div>

        {/* ===== 상단 KPI 카드 4개 ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          {/* 전체 회원 */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
            <Card className="h-32 shadow-sm ">
              <CardHeader className="flex justify-between pb-1">
                <CardTitle className="text-sm">전체 회원</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{animTotalUsers.toLocaleString()}명</p>
                <p className="text-xs text-muted-foreground mt-1">누적 활성회원 수</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 오늘의 면접 */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <Card className="h-32 shadow-sm ">
              <CardHeader className="flex justify-between pb-1">
                <CardTitle className="text-sm">오늘의 면접</CardTitle>
                <MessagesSquare className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">{animTodayInterview}회</p>
                <p className="text-xs text-muted-foreground mt-1">오늘 진행된 면접 수</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 오늘의 이력서 분석 */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-32 shadow-sm ">
              <CardHeader className="flex justify-between pb-1">
                <CardTitle className="text-sm">오늘의 이력서 분석</CardTitle>
                <Paperclip className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">{animTodayResume}회</p>
                <p className="text-xs text-muted-foreground mt-1">오늘 진행된 AI 이력서 분석</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 오늘의 매출 */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <Card className="h-32 shadow-sm ">
              <CardHeader className="flex justify-between pb-1">
                <CardTitle className="text-sm">오늘의 사용량(매출)</CardTitle>
                <BadgeDollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{animRevenue.toLocaleString()}원</p>
                <p className="text-xs text-muted-foreground mt-1">유료 서비스 기준</p>
              </CardContent>
            </Card>
          </motion.div>

        </div>

            {/* ===== 최근 7일 매출 추세 ===== */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              최근 7일 매출 추세
              <span className="ml-2 text-xs text-muted-foreground">
                (면접 / 이력서 / 총 매출)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
               {last7Days.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-20">
                    최근 7일 데이터가 없습니다.
                  </p>
              ) : (
            <LineChart
                height={340}
                xAxis={[
                  {
                    scaleType: "point",
                    data: last7Days.map((d) => d.day),
                  },
                ]}
                yAxis={[
                  {
                    valueFormatter: (value) =>
                      value.toLocaleString("ko-KR") + "원",
                  },
                ]}
                slotProps={{
                  tooltip: {
                    valueFormatter: (value) =>
                      value.toLocaleString("ko-KR") + "원",
                  },
                }}
                series={[
                  {
                    label: "면접 매출",
                    data: last7Days.map((d) => d.interviewRevenue),
                    curve: "catmullRom",
                    valueFormatter: (value) =>
                       value.toLocaleString("ko-KR") + "원",
                  },
                  {
                    label: "이력서 매출",
                    data: last7Days.map((d) => d.resumeRevenue),
                    curve: "catmullRom",
                    valueFormatter: (value) =>
                       value.toLocaleString("ko-KR") + "원",
                  },
                  {
                    label: "총 매출",
                    data: last7Days.map((d) => d.totalRevenue),
                    curve: "catmullRom",
                    valueFormatter: (value) =>
                       value.toLocaleString("ko-KR") + "원",
                  },
                ]}
                animation={{ duration: 800, easing: "ease-out" }}
              />
              )}
          </CardContent>
        </Card>
      </motion.div>

        {/* ===== Top 3 : 직무 / 기술 / 검색어 ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 직무 Top 3 */}
          <Top3Card title="직무 Top 3"  desc={
                <span className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 font-semibold">
                    최근 3개월
                  </span>
                  <span className="text-xs text-muted-foreground">
                    동률 시 최근 사용 우선
                  </span>
                </span>
              }
              icon={<Briefcase className="h-5 w-5 text-primary" />} items={topJobs} 
          />

          {/* 기술스택 Top 3 */}
          <Top3Card title="기술스택 Top 3"desc={
                    <span className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                        최근 3개월
                      </span>
                      <span className="text-xs text-muted-foreground">
                        동률 시 최근 사용 우선
                      </span>
                    </span>
                  }
            icon={<Code2 className="h-5 w-5 text-primary" />} items={topStacks} 
          />

          {/* 검색어 Top 3 */}
          <Top3Card title="검색 키워드 Top 3" desc={
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-700 font-semibold">
                      누적 기준
                    </span>
                    <span className="text-xs text-muted-foreground">
                      전체 기간 검색량
                    </span>
                  </span>
                }
                icon={<Search className="h-5 w-5 text-primary" />} items={topKeywords} 
          />
        </div>

      </div>
    </div>
  );
}

/* ===== TOP 3 공통 카드 컴포넌트 ===== */
//  동률일때는 직무/기술: 최근 사용된 게 위 ,키워드: 최근 검색된 게 위 로 설정되어있습니다.
function Top3Card({ title, desc, icon, items }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm h-full">
        <CardHeader className="flex justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
          </div>
          {icon}
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.rank} className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 flex justify-center items-center rounded-full text-xs font-bold ${
                      item.rank === 1 ? "bg-yellow-400 text-white"
                      : item.rank === 2 ? "bg-gray-300 text-gray-800"
                      : "bg-amber-800 text-white"
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.count}회</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
