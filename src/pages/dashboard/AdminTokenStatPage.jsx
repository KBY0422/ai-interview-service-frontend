import {
  LineChart,
  BarChart,
  PieChart,
  pieArcLabelClasses,
} from "@mui/x-charts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card2";

import { TrendingUp, MinusCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminTokenStat } from "../../api/api";



/* ===============================
   메인 컴포넌트
================================ */
export default function AdminTokenStatPage() {


   const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
  
     useEffect(() => {
      const loadDashboard = async () => {
        try {
          const res = await AdminTokenStat();
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




  /* ===============================
     KPI 데이터
  ================================ */
  // 하루 데이터
  const todayRevenue =dashboard?.card?.todayRevenue ?? 0;
  const todayGPTCost = dashboard?.card?.todayGptCost ?? 0;
  const todayProfit = dashboard?.card?.todayEstimatedProfit ?? 0;
  // 월별 데이터   
  const monthRevenue =dashboard?.card?.monthRevenue ?? 0;
  const monthGPTCost =dashboard?.card?.monthGptCost ?? 0;
  const monthProfit = dashboard?.card?.monthEstimatedProfit ?? 0;

  // 누적 매출,추정 이익
  const totalRevenue = dashboard?.cumulativeFinance?.totalRevenue ?? 0;
  const totalGPTCost = dashboard?.cumulativeFinance?.totalGptCost ?? 0;
  const totalProfit = dashboard?.cumulativeFinance?.totalEstimatedProfit ?? 0;

  /* ===============================
     서비스별 매출 / 순이익
  ================================ */
const serviceLabel = (svc) => {
  switch (svc) {
    case "SESSION": return "면접";
    case "RESUME": return "이력서";
    case "CHATBOT": return "챗봇";
    default: return svc;
  }
};

  const serviceFinance =
  dashboard?.monthlyrevenue?.map(r => ({
    service: serviceLabel(r.service),
    revenue: r.revenue ?? 0,
    profit: r.estimatedProfit ?? 0,
  })) ?? [];

  /* ===============================
     서비스 사용 비율
  ================================ */
 const usagePie =
  dashboard?.serviceUsageRatioList?.map((r, idx) => ({
    id: idx,
    value: r.gptCost ?? 0,
    label: serviceLabel(r.service),
  })) ?? [];

  /* ===============================
     최근 7일 GPT 비용 (서비스별)
  ================================ */
 const dailyServiceGPT =
  dashboard?.dailyServiceGptCostList?.map(d => ({
    day: d.date.slice(8) + "일",
    interview: d.interviewCost ?? 0,
    resume: d.resumeCost ?? 0,
    chatbot: d.chatbotCost ?? 0,
  })) ?? [];

  /* ===============================
     월별 GPT 비용 (서비스별)
  ================================ */
 const monthlyServiceGPT =
  dashboard?.monthlyServiceGptCostList?.map(m => ({
    month: m.month, // 이미 "11월", "12월"
    interview: m.interviewCost ?? 0,
    resume: m.resumeCost ?? 0,
    chatbot: m.chatbotCost ?? 0,
  })) ?? [];


  

 const dailyRevenueProfit =
  dashboard?.dailyRevenueProfitList?.map(d => ({
    day: d.date.slice(8) + "일",
    revenue: d.revenue ?? 0,
    profit: d.estimatedProfit ?? 0,
  })) ?? [];

  const monthlyRevenueProfit =
  dashboard?.monthlyRevenueProfitList?.map(m => ({
    month: m.month,
    revenue: m.revenue ?? 0,
    profit: m.estimatedProfit ?? 0,
  })) ?? [];


  
  if (loading) {
  return <div className="p-10">대시보드 로딩 중...</div>;
}
  /* ===============================
     렌더링
  ================================ */
  return (
    <div className="min-h-screen bg-[#f5f5fb]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">토큰 · 매출 통계</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-8">
            누적 매출 추이와 서비스별 사용 비율을 통해 비즈니스의 성장세를 확인해 보세요.
          </p>


        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <KPI title="오늘 매출" value={`${todayRevenue.toLocaleString()} 원`} icon={<TrendingUp  className="h-4 w-4 text-green-600"/>} />
          <KPI title="오늘 GPT 비용" value={`${todayGPTCost.toLocaleString()} 원`} icon={<MinusCircle className="h-4 w-4 text-red-500"/>} />
          <KPI title="오늘 추정 이익" value={`${todayProfit.toLocaleString()} 원`} icon={<Wallet className="h-4 w-4 text-emerald-600"/>} />
          <KPI title="이번달 매출" value={`${monthRevenue.toLocaleString()} 원`} icon={<TrendingUp  className="h-4 w-4 text-green-600" />} />
          <KPI title="이번달 GPT 비용" value={`${monthGPTCost.toLocaleString()} 원`} icon={<MinusCircle className="h-4 w-4 text-red-500"/>} />
          <KPI title="이번달 추정 이익" value={`${monthProfit.toLocaleString()} 원`} icon={<Wallet className="h-4 w-4 text-emerald-600"/>} />
        </div>

        {/* 서비스별 매출 / 순이익 + 사용 비율 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                서비스별 매출 · 추정 이익
               <span className="block text-xs text-muted-foreground mt-1">
                  (올해 누적 금액입니다.)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                height={320}
                xAxis={[{ scaleType: "band", data: serviceFinance.map(s => s.service) }]}
                series={[
                  { label: "매출", data: serviceFinance.map(s => s.revenue) },
                  { label: "추정 이익", data: serviceFinance.map(s => s.profit) },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                서비스 사용 비율
                 <span className="block text-xs text-muted-foreground mt-1">
                  (올해 기준으로 산정된 GPT 사용비용 비율입니다.)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                height={340}
                series={[{ data: usagePie, innerRadius: 50 , outerRadius: 120}]}
                sx={{ [`& .${pieArcLabelClasses.root}`]: { fontSize: 12 } }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">    
        {/* GPT 비용 */}
        {dailyServiceGPT.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-20">
            데이터가 없습니다.
          </p>
          ) : (
        <TwoLineChart
          title="최근 7일 GPT 비용 (서비스별)"
          labels={dailyServiceGPT.map(d => d.day)}
          series={[
            { label: "면접", data: dailyServiceGPT.map(d => d.interview) },
            { label: "이력서", data: dailyServiceGPT.map(d => d.resume) },
            { label: "챗봇", data: dailyServiceGPT.map(d => d.chatbot) },
          ]}
        />
        )}

        
        <TwoLineChart
          title="월별 GPT 비용 (서비스별)"
          labels={monthlyServiceGPT.map(m => m.month)}
          series={[
            { label: "면접", data: monthlyServiceGPT.map(m => m.interview) },
            { label: "이력서", data: monthlyServiceGPT.map(m => m.resume) },
            { label: "챗봇", data: monthlyServiceGPT.map(m => m.chatbot) },
          ]}
        />
         
        </div>    
           
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">   
          {dailyRevenueProfit.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-20">
            데이터가 없습니다.
          </p>
          ) : (  
        <TwoLineChart
          title="최근 7일 매출 · 추정 이익"
          labels={dailyRevenueProfit.map(d => d.day)}
          series={[
            { label: "매출", data: dailyRevenueProfit.map(d => d.revenue) },
            { label: "순이익", data: dailyRevenueProfit.map(d => d.profit) },
          ]}
        />
        )}
         
        <TwoLineChart
          title="월별 매출 · 추정 이익"
          labels={monthlyRevenueProfit.map(m => m.month)}
          series={[
            { label: "매출", data: monthlyRevenueProfit.map(m => m.revenue) },
            { label: "순이익", data: monthlyRevenueProfit.map(m => m.profit) },
          ]}
        />
        
        </div> 
        {/* 누적 카드 */}
        <div className="mt-2">
          <h2 className="text-lg font-semibold mb-4">
            누적 운영 결과 요약
          </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
          <SmallSummaryCard label="누적 매출" value={`${totalRevenue.toLocaleString()} 원`} />
          <SmallSummaryCard label="누적 GPT 비용" value={`${totalGPTCost.toLocaleString()} 원`} />
          <SmallSummaryCard label="누적 추정 이익" value={`${totalProfit.toLocaleString()} 원`} />
        </div>
      </div>
    </div>
   </div>  
  );
}

/* ===============================
   공통 컴포넌트
================================ */
function KPI({ title, value, icon }) {
  return (
    <Card className="h-24">
      <CardHeader className="flex justify-between flex-row pb-1">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SmallSummaryCard({ label, value }) {
  return (
    <Card className="h-24">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TwoLineChart({ title,description,labels, series }) {
  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
         {description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
      </CardHeader>
      <CardContent>
        <LineChart
          height={320}
          xAxis={[{ scaleType: "point", data: labels }]}
          series={series.map(s => ({ ...s, curve: "catmullRom" }))}
        />
      </CardContent>
    </Card>
  );
}
