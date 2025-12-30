import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { AlertTriangle, BookOpen } from "lucide-react"
import { noticeDetail } from "../../api/Auth"

import "../../styles/notice/NoticeDeletedDetailPage.css"

export default function NoticeDeletedDetailPage() {
  const { n_idx } = useParams()
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await noticeDetail(n_idx)
        setNotice(response.data?.data)
      } catch (err) {
        setError("삭제된 공지를 불러오지 못했습니다.")
      } finally {
        setLoading(false)
      }
    }

    if (n_idx) fetchNotice()
  }, [n_idx])

  if (loading) {
    return <div className="notice-loading">로딩중...</div>
  }

  if (error || !notice) {
    return (
      <div className="notice-page">
        <main className="notice-error">
          <p>삭제된 공지사항을 찾을 수 없습니다.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="notice-page" style={{marginTop:"64px"}}>

      <main className="notice-main">
        <div className="notice-wrapper">

          {/* 삭제 안내 */}
          <div className="notice-deleted-banner">
            <AlertTriangle size={20} />
            <span>이 공지사항은 삭제된 상태입니다.</span>
          </div>

          {/* 제목 */}
          <h1 className="notice-title">
            <BookOpen size={32} />
            {notice.n_title}
          </h1>

          {/* 본문 */}
          <Card>
            <CardHeader>
              <CardTitle className="notice-date text-main">
                작성일 : {notice.n_writedate.substring(0, 10)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="notice-content text-main">
                {notice.n_content}
              </p>
            </CardContent>
          </Card>

          {/* 삭제 사유 */}
          <Card className="notice-delete-card">
            <CardHeader>
              <CardTitle className="notice-delete-title">
                삭제 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>삭제 사유 :</strong>{" "}
                {notice.n_delete || "사유 없음"}
              </p>
            </CardContent>
          </Card>
  
          {/* 버튼 */}
          <div className="notice-button-area">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/notice")}
            >
              목록으로 돌아가기
            </Button>
          </div>

        </div>
      </main>

    </div>
  )
}
