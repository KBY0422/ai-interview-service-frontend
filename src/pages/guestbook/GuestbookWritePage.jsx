"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { guestBookInsert } from "../../api/Auth.jsx"

import "../../styles/guestbook/GuestbookWritePage.css"

export default function GuestbookWritePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    g_writer: "",
    g_title: "",
    g_content: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = async () => {
    if (!form.g_title.trim()) {
      alert("제목을 입력하세요")
      return
    }
    if (!form.g_content.trim()) {
      alert("내용을 입력하세요")
      return
    }

    try {
      const formdata = new FormData()
      formdata.append("g_writer", "GUEST")
      formdata.append("g_title", form.g_title)
      formdata.append("g_content", form.g_content)

      const response = await guestBookInsert(formdata)

      if (response.data.success) {
        alert("등록 완료")
        navigate("/guestbook")
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  const handleGoBack = () => {
    navigate("/guestbook")
  }
 
  return (
    <div className="write-page" style={{marginTop:"64px"}}>

      <main className="write-main">
        <div className="write-wrapper">
          <Card>
            <CardHeader>
              <CardTitle>방명록 작성</CardTitle>
            </CardHeader>
 
            <CardContent>
              <form className="write-form">
                <Input
                  placeholder="방명록 제목을 넣어주세요"
                  name="g_title"
                  value={form.g_title}
                  onChange={handleChange}
                />

                <Textarea
                  placeholder="AI-InterView에 대한 의견을 남겨주세요"
                  name="g_content"
                  value={form.g_content}
                  onChange={handleChange}
                  rows={8}
                />

                <div className="write-actions">
                  <Button variant="outline" onClick={handleGoBack}>
                    목록으로
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" onClick={handleEdit}>
                    등록하기
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  )
}
