import { inqueryDelete, inqueryDetail } from "../../api/Auth"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { BookOpen, MessageSquare, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

import "../../styles/inquery/InqueryDetailPage.css"
import useAuthStore from "../../store/AuthStore"

export default function InqueryDetailPage() {
  const { i_idx } = useParams()
  const [inquery, setInquery] = useState({ i_reply: "1" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pwd, setPwd] = useState("")

  const navigate = useNavigate()
  const location = useLocation()
  const fromPage = location.state?.fromPage ?? 1

  const isAnswered = inquery.i_reply === "0"

  const { zu_isLoggedIn, zu_user } = useAuthStore();

  const isOwner =
  zu_isLoggedIn &&
  Number(zu_user?.m_idx) === Number(inquery?.i_m_idx);

  const canEdit = isOwner;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await inqueryDetail(i_idx)
        setInquery(response.data?.data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
  }, [i_idx])

  if (loading) return <div className="center-text">로딩중...</div>
  if (error) return <div className="center-text">에러 발생...</div>
  if (!inquery) return null

  const handleGoBack = () => {
    navigate("/inquery", { state: { nowPage: fromPage } })
  }

  const handleGoUpdate = () => {
    if (!pwd) {
      alert("비밀번호를 입력해주세요.")
      return
    }
    navigate(`/inquery/update/${i_idx}`, {
      state: { inquery, i_pwd: pwd, fromPage },
    })
  }

  const handleGoDelete = async () => {
    if (!pwd) {
      alert("비밀번호를 입력해주세요.")
      return
    }
    if (!window.confirm("정말로 문의사항을 삭제하시겠습니까?")) return
     
    try {
      const response = await inqueryDelete(i_idx, pwd)
      if (response.data.success) {
        alert("삭제되었습니다.")
        navigate("/inquery", { state: { nowPage: fromPage } })
      } else {
        alert(response.data.message || "삭제 실패")
      }
    } catch (error) {
      alert(error.message)
    }
  }

  

  return (
    <div className="inquiry-detail-page" style={{marginTop:"64px"}}>

      <main className="detail-main">
        <div className="detail-wrapper">
          <h1 className="detail-title">
            <BookOpen className="icon-large" />
            {inquery.i_title}

            <span
              className={
                inquery.i_category === "1"
                  ? "badge badge-question"
                  : "badge badge-voice"
              }
            >
              {inquery.i_category === "1" ? "문의하기" : "고객의소리"}
            </span>

            <span
              className={
                inquery.i_reply === "1"
                  ? "badge badge-wait"
                  : "badge badge-done"
              }
            >
              {inquery.i_reply === "1" ? "응답대기" : "답변완료"}
            </span>
          </h1>

          <Card>
            <CardHeader>
              <CardTitle className="meta">
                <div className="writer text-main">
                  <User className="icon-small" />
                  {inquery.i_writer}
                </div>
                <span>{inquery.i_writedate.substring(0, 10)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="content-text">{inquery.i_content}</p>
            </CardContent>
          </Card>
 
          {isAnswered && (
            <>
              <div className="answer-title">
                <MessageSquare className="icon-small" />
                관리자 답변
              </div>
              <Card className="answer-card">
                <CardContent>
                  <p className="content-text">{inquery.i_response}</p>
                </CardContent>
              </Card>
            </>
          )}

          {canEdit && (
          <div className="password-box">
            <Input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>
        )}

         <div className="button-group">
            <Button variant="outline" onClick={handleGoBack}>
              목록으로
            </Button>

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  disabled={isAnswered}
                  className={isAnswered ? "disabled" : ""}
                  onClick={handleGoUpdate}
                >
                  수정하기
                </Button>

                <Button variant="outline" onClick={handleGoDelete}>
                  삭제하기
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
