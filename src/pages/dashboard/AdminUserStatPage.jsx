import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card2";
import { Users, UserPlus, TrendingUp } from "lucide-react";
import { LineChart, BarChart, Gauge, ChartContainer, ChartsXAxis, ChartsYAxis, BarPlot, ChartsTooltip, ChartsLegend } from "@mui/x-charts";
import { AdminUserStat } from "../../api/api";

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




export default function AdminUserStatPage() {

     const [dashboard, setDashboard] = useState(null);
      const [loading, setLoading] = useState(true);
    
       useEffect(() => {
        const loadDashboard = async () => {
          try {
            const res = await AdminUserStat();
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


  // ===== KPI 데이터 ===== dashboard?.summary?.totalUserCount ?? 0;
  const totalUsers = dashboard?.summary?.totalUserCount ?? 0;
  const activeUsers = dashboard?.summary?.activeUserCount ?? 0;;
  const todaySignups = dashboard?.summary?.todaySignupCount ?? 0;;
  const weekSignups = dashboard?.summary?.weekSignupCount ?? 0;;

  const activeRate = (activeUsers / totalUsers) * 100;

  // 애니메이션 숫자 적용
  const animTotal = useCounter(activeUsers);
  const animToday = useCounter(todaySignups);
  const animWeek = useCounter(weekSignups);
  const animActivePercent = useCounter(activeRate);

  // ===== 일별 데이터 =====
  const dailySignupStats =
  dashboard?.dailySignupTrend?.map(d => ({
    day: d.signupDate.slice(8) + "일",
    count: d.signupCount,
  })) ?? [];

  // ===== 월별 활성/비활성 =====
const monthlyTotalUsers =
  dashboard?.monthlyUserCount?.map(m => ({
    month: m.month.slice(5) + "월",
    total: m.totalUserCount,
  })) ?? [];

const monthlyJoinCount = dashboard?.monthlyJoinCount ?? [];
const monthlyInactiveUserStat = dashboard?.monthlyInactiveUserStat ?? [];

// month → 값 매핑
const joinMap = Object.fromEntries(
  monthlyJoinCount.map(item => [item.month, item.joinCount])
);

const inactiveMap = Object.fromEntries(
  monthlyInactiveUserStat.map(item => [item.month, item.inactiveUserCount])
);

// 월 목록 통합
const months = Array.from(
  new Set([...Object.keys(joinMap), ...Object.keys(inactiveMap)])
).sort();

// ⭐ ChartContainer용 dataset
const monthlyActiveDataset = months.map(month => {
  const join = joinMap[month] ?? 0;
  const inactive = inactiveMap[month] ?? 0;

  return {
    month: month.slice(5) + "월",
    active: join,                 // 가입
    inactive: inactive,           // 탈퇴
    total: join + inactive,       // ⭐ 변동 규모
  };
});

  if (loading) {
  return <div className="p-10">대시보드 로딩 중...</div>;
}
  return (
    <div className="min-h-screen bg-[#f5f5fb]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* 타이틀 */}
        <h1 className="text-3xl font-bold mb-2">사용자 통계</h1>
        <p className="text-muted-foreground mb-8">
          사용자 증가 흐름과 활성 사용자 현황을 확인해 보세요.
        </p>

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">

          {/* 전체 회원 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="h-36 flex flex-col justify-between">
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>전체 회원</CardTitle>
            <Users />
          </CardHeader>
          <CardContent className="flex flex-col pt-0">
            {/* 메인 숫자 */}
            <p className="text-3xl font-bold text-primary leading-tight">
              {animTotal.toLocaleString()} 명
            </p>

            {/* 증가/감소율 표시 */}
            {/* <p
              className={`text-xs mt-1 flex items-center gap-1 
                ${
                totalUserGrowth > 0
                  ? "text-green-600"
                  : totalUserGrowth < 0
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {totalUserGrowth > 0 && "▲"}
              {totalUserGrowth < 0 && "▼"}
              {Math.abs(totalUserGrowth)}%
              <span className="text-[10px] text-muted-foreground">(전일 대비)</span>
            </p> */}

             <p className="text-xs text-muted-foreground mt-1">누적 활성 회원수</p>
          
          </CardContent>
        </Card>
      </motion.div>


          {/* 오늘 가입 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="h-36 flex flex-col justify-between">
              <CardHeader className="flex justify-between pb-2">
                <CardTitle>오늘 가입</CardTitle>
                <UserPlus />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{animToday} 명</p>
                <p className="text-xs text-muted-foreground mt-1">오늘 등록된 신규 사용자</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 주간 가입 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-36 flex flex-col justify-between">
              <CardHeader className="flex justify-between pb-2">
                <CardTitle>이번주 가입</CardTitle>
                <TrendingUp />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{animWeek} 명</p>
                 <p className="text-xs text-muted-foreground mt-1">지난 7일간 가입한 사용자</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 활성 사용자 비율 */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
            <Card className="h-36 flex flex-col justify-between">
              <CardHeader>
                <CardTitle>활성 사용자 비율</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <Gauge
                  width={95}
                  height={95}
                  value={activeRate}
                  valueMax={100}
                  text={`${animActivePercent.toFixed(1)}%`}
                />
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* 일별 + 월별 차트 (2열) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* 일별 회원가입 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 7일간 회원가입수 변동</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                height={300}
                xAxis={[{ scaleType: "point", data: dailySignupStats.map((d) => d.day) }]}
                series={[
                  {
                    label: "가입 수",
                    data: dailySignupStats.map((d) => d.count),
                    color: "#6366f1",
                    curve: "catmullRom",
                    area: true,
                  },
                ]}
                tooltip
              />
            </CardContent>
          </Card>

          {/* 월별 전체 증가 */}
          <Card>
            <CardHeader>
              <CardTitle>월별 회원가입수 변동</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                            height={300}
                xAxis={[{ scaleType: "band", data: monthlyTotalUsers.map(d => d.month) }]}
                series={[
                  {
                    label: "회원 가입 수",
                    data: monthlyTotalUsers.map(d => d.total),
                    color: "#f59e0b",
                  },
                ]}
              />
            </CardContent>
          </Card>

        </div>

        {/* Composition (활성/비활성 + 전체 사용자 Line) */}
                <Card>
          <CardHeader>
            <CardTitle>월별 가입자 및 탈퇴 회원수</CardTitle>
          </CardHeader>

          <CardContent>
              {monthlyActiveDataset.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-24">
                데이터가 없습니다.
              </div>
            ) : (
            <ChartContainer
               height={360}
                      series={[
                        { type: "bar", dataKey: "active", stack: "users", label: "가입자 수", color: "#34d399" },
                        { type: "bar", dataKey: "inactive", stack: "users", label: "탈퇴 회원수", color: "#f87171" },
                      ]}
                      dataset={monthlyActiveDataset}
                      xAxis={[{ id: "x", dataKey: "month", scaleType: "band" }]}
                      yAxis={[
                        { id: "leftAxis", label: "사용자 수" },
                      ]}
                    >
              <ChartsXAxis axisId="x" />
              <ChartsYAxis axisId="leftAxis" />

              {/* BAR */}
              <BarPlot />
              <ChartsTooltip />
              <ChartsLegend />
            </ChartContainer>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
