import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { MessageSquare } from "lucide-react"
import { inqueryPageList } from "../../api/Auth"
import Pagination from "../../components/ui/Paging"
import { useNavigate } from "react-router-dom"

import "../../styles/inquery/AdminInquiryManagePage.css"

export default function AdminInquiryManagePage() {
  const [inqueryList, setInqueryList] = useState([])
  const [pageInfo, setPageInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const getData = async (page = 1) => {
    try {
      setLoading(true)

      const response = await inqueryPageList({ nowPage: page })
      const list = response.data?.data?.inquerylist
      const paging = response.data?.data?.paging

      setInqueryList(Array.isArray(list) ? list : [])
      setPageInfo(paging || {})
    } catch (error) {
      setError(error.message)
      alert("정보 가져오기 실패")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page !== pageInfo.nowPage) {
      getData(page)
    }
  }

  const handleResponse = (i_idx) => {
    navigate(`/admin/inquery/response/${i_idx}`, {
      state: { i_idx },
    })
  }

  useEffect(() => {
    getData(1)
  }, [])

  if (loading)
    return <div className="center-text">로딩 중</div>

  if (error)
    return <div className="error-text">{error}</div>

  return (
    <div className="inquiry-admin-page">
      <div className="admin-header">
        <h1 className="admin-title">문의사항 관리</h1>
        <p className="admin-desc">회원 문의사항을 확인하고 답변합니다 (총 {pageInfo.totalRecord}건)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문의사항 목록</CardTitle>
        </CardHeader>
 
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>번호</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>분류</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {inqueryList.map((entry, index) => (
                <TableRow key={entry.i_idx}>
                  <TableCell>
                    {(pageInfo.nowPage - 1) * pageInfo.numPerPage + index + 1}
                  </TableCell>
                  <TableCell className="title-cell">{entry.i_title}</TableCell>
                  <TableCell>{entry.i_writer}</TableCell>
                  <TableCell>{entry.i_writedate.substring(0, 10)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        entry.i_category === "1"
                          ? "badge badge-question"
                          : "badge badge-voice"
                      }
                    >
                      {entry.i_category === "1" ? "문의하기" : "고객의소리"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        entry.i_reply === "1"
                          ? "status status-wait"
                          : "status status-done"
                      }
                    >
                      {entry.i_reply === "1" ? "응답대기" : "답변완료"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResponse(entry.i_idx)}
                    >  
                      {entry.i_reply === "1" ? (
                        <>
                          <MessageSquare className="icon" /> 답변
                        </>
                      ) : (
                        "답변완료"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
 
          {pageInfo.totalPage > 1 && (
            <div className="pagination-wrap">
              <Pagination
                pageInfo={pageInfo}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
