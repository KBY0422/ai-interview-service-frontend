import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { noticeDetail, noticeUpdate } from "../../api/Auth"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

import "../../styles/notice/NoticeUpdatePage.css"

export default function NoticeUpdatePage() {
  const navigate = useNavigate()
  const { n_idx } = useParams()

  const [form, setForm] = useState({
    n_idx: "",
    n_title: "",
    n_content: "",
    n_pin: "0" // 추가: 고정 여부 상태값 (기본 0)
  })
  
  /** 기존 공지 조회 */
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await noticeDetail(n_idx)
        const data = res.data.data

        setForm({
          n_idx: data.n_idx,
          n_title: data.n_title,
          n_content: data.n_content,
          n_pin: data.n_pin // 추가: 서버에서 받아온 n_pin 설정
        })
      } catch (err) {
        alert("공지 정보를 불러오지 못했습니다.")
        navigate("/admin/notice")
      }
    } 

    if (n_idx) fetchNotice()
  }, [n_idx, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = async () => {
    if (!form.n_content.trim()) {
      alert("내용을 입력하세요")
      return
    }

    try {
      const formData = new FormData()
      formData.append("n_idx", form.n_idx)
      formData.append("n_title", form.n_title)
      formData.append("n_content", form.n_content)
      formData.append("n_pin", form.n_pin) // 추가: 수정된 n_pin 전송

      const response = await noticeUpdate(formData)
      if (response.data.success) {
        alert("수정 완료")
        navigate("/admin/notice")
      }
    } catch (error) {
      console.error(error)
      alert("수정 실패")
    }
  }

  const handleGoBack = () => {
    navigate("/admin/notice")
  }

  return (
    <div className="notice-update-page" style={{marginTop:"64px"}}>

      <main className="notice-update-main">
        <div className="notice-update-wrapper">
          <Card>
            <CardHeader>
              <CardTitle>공지사항 수정</CardTitle>
            </CardHeader>

            <CardContent>
              {/* 추가: 상단 고정 여부 선택 콤보박스(Select) 영역 */}
              <div className="update-pin-section">
                <label htmlFor="n_pin" className="pin-label">공지 유형</label>
                <select 
                  id="n_pin"
                  name="n_pin" 
                  value={form.n_pin} 
                  onChange={handleChange}
                  className="pin-select"
                >
                  <option value="0">공지사항(일반)</option>
                  <option value="1">공지사항(상단고정)</option>
                </select>
              </div>              

              <Input
                name="n_title"
                value={form.n_title}
                onChange={handleChange}
              />

              <Textarea
                name="n_content"
                value={form.n_content}
                onChange={handleChange}
                rows={8}
              />

              <div className="notice-update-actions">
                <Button variant="outline" onClick={handleGoBack}>
                  목록으로
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  수정하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  )
}
