import { inqueryDetail, inqueryResponseUpdate } from "../../api/Auth"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BookOpen, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"

import "../../styles/inquery/InqueryResponsePage.css"

export default function InqueryResponsePage() {
  const { i_idx } = useParams()
  const [inquery, setInquery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const navigate = useNavigate()

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

  const handleGoBack = () => {
    navigate("/admin/inquiry")
  }
 
  const handleChange = (e) => {
    setInquery((prev) => ({
      ...prev,
      i_response: e.target.value,
    }))
  }

  const handleGoUpdate = async () => {
    if (!inquery.i_response || inquery.i_response.trim() === "") {
      alert("답변을 입력해주세요.")
      return
    }

    try {
      await inqueryResponseUpdate(inquery.i_idx, inquery.i_response)
      alert("답변이 등록되었습니다.")
      navigate("/admin/inquiry")
    } catch (err) {
      alert("답변 등록 실패")
    }
  }

  if (loading) return <div className="center-text">로딩중...</div>
  if (error) return <div className="center-text">에러 발생...</div>
  if (!inquery) return null
 
  return (
    <div className="inquiry-response-page" style={{marginTop:"64px"}}>

      <main className="response-main">
        <div className="response-wrapper">
          <h1 className="response-title">
            <BookOpen className="icon-large" />
            {inquery.i_title}
          </h1>

          {/* 문의 내용 */}
          <Card>
            <CardHeader>
              <CardTitle className="meta">
                <span className="writer">
                  <User className="icon-small" />
                  {inquery.i_writer}
                </span>
                <span>{inquery.i_writedate.substring(0, 10)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="content-text">{inquery.i_content}</p>
            </CardContent>
          </Card>

          {/* 답변 작성 */}
          <Card className="response-card">
            <CardHeader>
              <CardTitle>답변 작성</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="답변을 입력하세요"
                value={inquery.i_response || ""}
                onChange={handleChange}
                rows={8}
              />
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="button-group">
            <Button variant="outline" onClick={handleGoBack}>
              목록으로
            </Button>
            <Button variant="outline" onClick={handleGoUpdate}>
              답변하기
            </Button>
          </div>
        </div>
      </main>

    </div>
  )
}
