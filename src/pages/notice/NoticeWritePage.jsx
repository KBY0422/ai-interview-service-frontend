import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { noticeInsert } from "../../api/Auth"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

import "../../styles/notice/NoticeWritePage.css"

export default function NoticeWritePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    n_title: "",
    n_content: "",
    n_pin: "0" // 기본값은 일반공지(0)
  })

  const handleChange = (e) => {
    //const { name, value } = e.target
    //setForm(prev => ({ ...prev, [name]: value }))
    
    const { name, value, type, checked } = e.target
    // 체크박스일 경우 체크되면 "1", 아니면 "0"을 할당
    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked ? "1" : "0" }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }    

  }

  const handleSubmit = async () => {
    if (!form.n_title.trim()) {
      alert("제목을 입력하세요")
      return
    }

    if (!form.n_content.trim()) {
      alert("내용을 입력하세요")
      return
    }

    try {
      const formData = new FormData()
      formData.append("n_title", form.n_title)
      formData.append("n_content", form.n_content)
      formData.append("n_pin", form.n_pin) // 상단 고정 여부 추가

      const response = await noticeInsert(formData)      
      if (response.data.success) {
        alert("등록 완료")
        navigate("/admin/notice")
      }
    } catch (error) {
      console.error(error)
      alert("등록 실패")
    }
  }

  const handleGoBack = () => {
    navigate("/admin/notice")
  }

  return (
    <div className="notice-write-page" style={{marginTop:"64px"}}>
      <main className="notice-write-main">
        <div className="notice-write-wrapper">
          <Card>
            <CardHeader>
              <CardTitle>공지사항 작성</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 수정 페이지와 동일한 구조의 콤보박스 추가 */}
              <div className="write-pin-section" style={{ marginBottom: "15px" }}>
                <label htmlFor="n_pin" className="pin-label" style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>공지 유형</label>
                <select 
                  id="n_pin"
                  name="n_pin" 
                  value={form.n_pin} 
                  onChange={handleChange}
                  className="pin-select"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="0">공지사항(일반)</option>
                  <option value="1">공지사항(상단고정)</option>
                </select>
              </div>            
              <Input
                placeholder="제목을 입력하세요"
                name="n_title"
                value={form.n_title}
                onChange={handleChange}
              />

              <Textarea
                placeholder="공지사항 내용을 입력하세요"
                name="n_content"
                value={form.n_content}
                onChange={handleChange}
                rows={8}
              />

              <div className="notice-write-actions">
                <Button variant="outline" onClick={handleGoBack}>
                  목록으로
                </Button>
                <Button variant="outline" onClick={handleSubmit}>
                  등록하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
