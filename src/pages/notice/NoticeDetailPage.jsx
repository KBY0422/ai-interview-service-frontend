import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { BookOpen } from "lucide-react"
import { noticeDetail } from "../../api/Auth"

import "../../styles/notice/NoticeDetailPage.css"

export default function NoticeDetailPage() {
  const { n_idx } = useParams()
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const fromPage = location.state?.fromPage ?? 1

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await noticeDetail(n_idx)
        setNotice(response.data?.data)
      } catch (err) {
        setError("공지사항을 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    }

    if (n_idx) fetchDetail()
  }, [n_idx])

  if (loading) return <div className="notice-detail-center">로딩중...</div>
  if (error) return <div className="notice-detail-center">{error}</div>

  if (!notice) {
    return (
      <div className="notice-detail-page">
        <main className="notice-detail-main">
          <p className="notice-detail-error">
            공지사항 항목을 찾을 수 없습니다.
          </p>
        </main>
      </div>
    )
  }
 
  const handleGoBack = () => {
    navigate("/notice", {
      state: { nowPage: fromPage }
    })
  }

  return (
    <div className="notice-detail-page" style={{marginTop:"64px"}}>

      <main className="notice-detail-main">
        <div className="notice-detail-wrapper">
          <h1 className="notice-detail-title">
            <BookOpen className="notice-detail-icon" />
            {notice.n_pin === "1" && (
              <span className="notice-detail-pin-badge">중요</span>
            )}
            {notice.n_title}
          </h1>

          <Card>
            <CardHeader>
              <CardTitle className="notice-detail-date text-main">
                {notice.n_writedate.substring(0, 10)}
              </CardTitle>
            </CardHeader>
            <CardContent className="notice-detail-content">
              <p>{notice.n_content}</p>
            </CardContent>
          </Card>
 
          <div className="notice-detail-buttons">
            <Button variant="outline" onClick={handleGoBack}>
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </main>

    </div>
  )
}
