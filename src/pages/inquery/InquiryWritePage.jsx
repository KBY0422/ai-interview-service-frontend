"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { inqueryInsert } from "../../api/Auth"

import "../../styles/inquery/InquiryWritePage.css"

export default function InquiryWritePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPage = location.state?.fromPage ?? 1

  const [form, setForm] = useState({
    i_category: "1",
    i_writer: "",
    i_title: "",
    i_content: "",
    i_pwd: ""
  })

  const CATEGORY_CONFIG = {
    "1": {
      title: "문의하기",
      submitText: "문의하기",
      contentPlaceholder: "문의 내용을 입력하세요"
    },
    "2": {
      title: "고객의 소리",
      submitText: "의견 등록",
      contentPlaceholder: "불편사항이나 의견을 입력해주세요"
    }
  }

  const currentCategory =
    CATEGORY_CONFIG[form.i_category] ?? CATEGORY_CONFIG["1"]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = async () => {
    if (!form.i_category.trim()) { alert("분류를 선택하세요"); return }
    if (!form.i_writer.trim())   { alert("닉네임을 입력하세요"); return }
    if (!form.i_title.trim())    { alert("제목을 입력하세요"); return }
    if (!form.i_content.trim())  { alert(currentCategory.contentPlaceholder); return }
    if (!form.i_pwd.trim())      { alert("비밀번호를 입력하세요"); return }

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      )

      const response = await inqueryInsert(formData)
      if (response.data.success) {
        alert("등록 완료")
        navigate("/inquery")
      }
    } catch (err) {
      console.error(err)
      alert("등록 실패")
    }
  }
 
  const handleGoBack = () => {
    navigate("/inquery", {
      state: { nowPage: fromPage }
    })
  }

  return (
    <div className="inquiry-write-page bg-page" style={{marginTop:"64px"}}>

      <main className="write-main">
        <div className="write-wrapper">
          <Card>
            <CardHeader>
              <CardTitle>{currentCategory.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <form className="write-form " > 
                <select 
                  name="i_category"
                  value={form.i_category}
                  onChange={handleChange}
                  className="select-box bg-section"
                >
                  <option value="1">문의하기</option>
                  <option value="2">고객의소리</option>
                </select>

                <Input
                  name="i_writer"
                  value={form.i_writer}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                />

                <Input
                  name="i_title"
                  value={form.i_title}
                  onChange={handleChange}
                  placeholder="등록하실 제목을 입력하세요"
                />
 
                <Textarea
                  name="i_content"
                  value={form.i_content}
                  onChange={handleChange}
                  placeholder={currentCategory.contentPlaceholder}                  
                />
                <div className="password-wrapper">
                  <Input
                    name="i_pwd"
                    type="password"
                    value={form.i_pwd}
                    onChange={handleChange}
                    placeholder="삭제 시 사용할 비밀번호를 입력하세요"
                  />
                </div>
                <div className="button-group">
                  <Button variant="outline" onClick={handleGoBack}>
                    목록으로
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    {currentCategory.submitText}
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
