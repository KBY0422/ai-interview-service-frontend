import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table"

import { Plus, Pencil, Trash2 } from "lucide-react"
import { noticeAdminPageList } from "../../api/Auth"
import Pagination from "../../components/ui/Paging"

import "../../styles/notice/AdminNoticeManagePage.css"

export default function AdminNoticeManagePage() {
  const [noticeList, setNoticeList] = useState([])
  const [pageInfo, setPageInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const getData = async (page = 1) => {
    try {
      setLoading(true)

      const response = await noticeAdminPageList({ nowPage: page })
      const list = response.data?.data?.noticelist
      const paging = response.data?.data?.paging

      setNoticeList(Array.isArray(list) ? list : [])
      setPageInfo(paging || {})
    } catch (err) {
      setError(err.message)
      alert("정보 가져오기 실패")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData(1)
  }, [])

  const handlePageChange = (page) => {
    if (page !== pageInfo.nowPage) {
      getData(page)
    }
  }

  const handleInsert = () => navigate("/admin/notice/write")
  const handleUpdate = (n_idx) => navigate(`/admin/notice/update/${n_idx}`, { state: { n_idx } })
  const handleDelete = (n_idx) => navigate(`/admin/notice/delete/${n_idx}`, { state: { n_idx } })
  const handleDeletedDetail = (n_idx) => navigate(`/admin/notice/deleted/${n_idx}`)

  if (loading) return <div className="center-text">로딩 중</div>
  if (error) return <div className="center-text error">{error}</div>

  return (
    <div className="admin-notice-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">공지사항 관리</h1>
          <p className="page-desc">
            공지사항을 등록하고 관리합니다 (총 {pageInfo.totalRecord}건)
          </p>
        </div>
 
        <Button className="write-btn primary" onClick={handleInsert}>
          <Plus className="icon" />
          공지사항 작성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>공지사항 목록</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>번호</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>조회수</TableHead>
                <TableHead>상태</TableHead>                
                <TableHead>고정여부</TableHead>   {/* 1. 고정 여부 헤더 추가 */}
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {noticeList.map((entry, index) => (
                <TableRow key={entry.n_idx}>
                  <TableCell>
                    {(pageInfo.nowPage - 1) * pageInfo.numPerPage + index + 1}
                  </TableCell>
                  <TableCell className="title-cell">{entry.n_title}</TableCell>
                  <TableCell>{entry.n_writedate.substring(0, 10)}</TableCell>
                  <TableCell>{entry.n_hit.toLocaleString()}</TableCell>

                  <TableCell>
                    <button
                      disabled={entry.n_active !== "0"}
                      onClick={() => handleDeletedDetail(entry.n_idx)}
                      className={`status-btn ${
                        entry.n_active === "1" ?  "active" : "deleted"
                      }`}
                    >
                      {entry.n_active === "1" ?  "정상" : "삭제됨"}
                    </button>
                  </TableCell>
                  
                  {/* 2. 고정 여부 셀 추가 */}
                  <TableCell>
                    <span className={`pin-status ${entry.n_pin === "1" ? "is-pinned" : "is-normal"}`}>
                      {entry.n_pin === "1" ? <div className="badge-pin">📌 고정</div> 
                                           : <div> &nbsp;&nbsp; - &nbsp;&nbsp; </div>}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="action-buttons">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={entry.n_active === "0"}
                        onClick={() => handleUpdate(entry.n_idx)}
                      >
                        <Pencil className="icon-sm" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={entry.n_active === "0"}
                        onClick={() => handleDelete(entry.n_idx)}
                      >
                        <Trash2 className="icon-sm" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pageInfo.totalPage > 1 && (
            <div className="paging-wrapper" >
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
