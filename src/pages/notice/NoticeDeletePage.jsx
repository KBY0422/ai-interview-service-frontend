import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { noticeDelete, noticeDetail } from "../../api/Auth"

import "../../styles/notice/NoticeDeletePage.css"

export default function NoticeDeletePage() {
  const navigate = useNavigate()
  const { n_idx } = useParams()

  const [form, setForm] = useState({
    n_idx: "",
    n_title: "",
    n_content: "",
    n_delete: ""
  })

  /* 기존 공지 조회 */
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await noticeDetail(n_idx)
        const data = res.data.data

        setForm({
          n_idx: data.n_idx,
          n_title: data.n_title,
          n_content: data.n_content,
          n_delete: data.n_delete ?? ""
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
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDelete = async () => {
    if (!form.n_delete.trim()) {
      alert("삭제 사유를 입력하세요")
      return
    }

    try {
      const formdata = new FormData()
      formdata.append("n_idx", form.n_idx)
      formdata.append("n_delete", form.n_delete)

      const response = await noticeDelete(formdata)

      if (response.data.success) {
        alert("삭제 완료")
        navigate("/admin/notice")
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className="notice-delete-page" style={{marginTop:"64px"}}>

      <main className="notice-delete-main">
        <div className="notice-delete-wrapper">
          <Card>
            <CardHeader>
              <CardTitle>공지사항 삭제</CardTitle>
            </CardHeader>

            <CardContent className="notice-delete-content">
              <Input
                name="n_title"
                value={form.n_title}
                readOnly
              />

              <Textarea
                name="n_content"
                value={form.n_content}
                readOnly
                rows={8}
              />

              <Textarea
                name="n_delete"
                value={form.n_delete}
                onChange={handleChange}
                rows={6}
                placeholder="삭제 사유를 입력하세요"
              />

              <div className="notice-delete-buttons">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/notice")}
                >
                  목록으로
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                >
                  삭제하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
  
    </div>
  )
}
