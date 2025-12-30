import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { BookOpen, User } from "lucide-react"
import { Button } from "../../components/ui/button.jsx"
import { useEffect, useState } from "react"
import { guestBookDetail } from "../../api/Auth.jsx"

import "../../styles/guestbook/GuestbookDetailPage.css"
 
export default function GuestbookDetailPage() {
  const { g_idx } = useParams()
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const fromPage = location.state?.fromPage ?? 1
 
  useEffect(() => {
    const loadDetail = async () => {
      try {
        const response = await guestBookDetail(g_idx)
        setGuest(response.data?.data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [g_idx])

  if (loading) return <div className="center-text">로딩중...</div>
  if (error) return <div className="center-text">에러 발생...</div>

  if (!guest) {
    return (
      <div className="detail-page">
        <main className="detail-main">
          <p className="not-found">방명록 항목을 찾을 수 없습니다.</p>
        </main>
      </div>
    )
  }

  const handleGoBack = () => {
    navigate("/guestbook", { state: { nowPage: fromPage } })
  }

  return (
    <div className="detail-page" style={{marginTop:"64px"}}>

      <main className="detail-main">
        <div className="detail-wrapper">
          <h1 className="detail-title">
            <BookOpen className="detail-title-icon" />
            {guest.g_title}
          </h1>

          <Card>
            <CardHeader>
              <CardTitle className="detail-card-header">
                <span className="detail-writer">
                  <User className="detail-writer-icon" />
                  {guest.g_writer}
                </span>
                <span className="detail-date">{guest.g_writedate.substring(0, 10)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="detail-content">
              <p className="detail-text">{guest.g_content}</p>
            </CardContent>
          </Card>

          <div className="detail-actions">
            <Button variant="outline" onClick={handleGoBack}>목록으로 돌아가기</Button>
          </div>
        </div>
      </main>

    </div>
  )
}
