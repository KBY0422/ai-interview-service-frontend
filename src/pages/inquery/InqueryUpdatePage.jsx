"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { inqueryUpdate } from "../../api/Auth"

import "../../styles/inquery/InqueryUpdatePage.css"
import useAuthStore from "../../store/AuthStore"

export default function InqueryUpdatePage() {
  const navigate = useNavigate()
  const { i_idx } = useParams()
  const location = useLocation()

  const fromPage = location.state?.fromPage ?? 1
  const origin = location.state?.inquery
  const passedPwd = location.state?.i_pwd
  const { zu_user } = useAuthStore();

  const [form, setForm] = useState({
    i_category: "",
    i_writer: "",
    i_title: "",
    i_content: "",
    i_pwd: ""
  })

        // 1️⃣ 주소 직접 접근 차단
      useEffect(() => {
        if (!origin) {
          alert("잘못된 접근입니다.");
          navigate("/inquery");
        }
      }, [origin, navigate]);

      // 2️⃣ 작성자 본인 확인
      useEffect(() => {
        if (!origin || !zu_user) return;

        if (Number(origin.i_m_idx) !== Number(zu_user.m_idx)) {
          alert("본인 문의만 수정할 수 있습니다.");
          navigate("/inquery");
        }
      }, [origin, zu_user, navigate]);


  /** 기존 데이터 세팅 */
  useEffect(() => {
    if (origin) {
      setForm({
        i_category: origin.i_category,
        i_writer: origin.i_writer,
        i_title: origin.i_title,
        i_content: origin.i_content,
        i_pwd: passedPwd || ""
      })
    }
  }, [origin, passedPwd])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = async (e) => {
    e.preventDefault()

    if (!form.i_category.trim()) { alert("분류를 입력하세요"); return }
    if (!form.i_writer.trim())   { alert("닉네임을 입력하세요"); return }
    if (!form.i_title.trim())    { alert("제목을 입력하세요"); return }
    if (!form.i_content.trim())  { alert("내용을 입력하세요"); return }

    try {
      const formData = new FormData()
      formData.append("i_idx", i_idx)
      formData.append("i_category", form.i_category)
      formData.append("i_writer", form.i_writer)
      formData.append("i_title", form.i_title)
      formData.append("i_content", form.i_content)
      formData.append("i_pwd", form.i_pwd)

      const response = await inqueryUpdate(formData)

      if (response.data.success) {
        alert("수정 완료")
        navigate("/inquery", {
          state: { nowPage: fromPage }
        })
      } else {
        alert(response.data.message || "수정 실패")
      }
    } catch (err) {
      alert("비밀번호가 틀리거나 수정에 실패했습니다.")
    }
  }
 
  const handleGoBack = () => {
    navigate("/inquery")
  }

  return (
    <div className="inquiry-update-page" style={{marginTop:"64px"}}>

      <main className="update-main">
        <div className="update-wrapper">
          <Card>
            <CardHeader>
              <CardTitle>문의사항 수정</CardTitle>
            </CardHeader>

            <CardContent className="update-form">
              <Input
                name="i_category"
                value={form.i_category}
                readOnly
              />

              <Input
                name="i_writer"
                value={form.i_writer}
                readOnly
              />

              <Input
                name="i_title"
                value={form.i_title}
                onChange={handleChange}
              />

              <Textarea
                name="i_content"
                value={form.i_content}
                onChange={handleChange}
                rows={8}
              />

              <Input
                name="i_pwd"
                type="hidden"
                value={form.i_pwd}
                readOnly
              />

              <div className="button-group">
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
