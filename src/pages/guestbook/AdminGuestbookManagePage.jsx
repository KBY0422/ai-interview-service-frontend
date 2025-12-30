import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Trash2 } from "lucide-react"
import { guestBookDelete, guestBookPageList } from "../../api/Auth"
import Pagination from "../../components/ui/Paging.jsx"

import "../../styles/guestbook/AdminGuestbookManagePage.css"

export default function AdminGuestbookManagePage() {
  const [guestList, setGuestList] = useState([])
  const [pageInfo, setPageInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getData = async (page = 1) => {
    try {
      setLoading(true)
      const response = await guestBookPageList({ nowPage: page })
      const list = response.data?.data?.guestlist
      const paging = response.data?.data?.paging
      setGuestList(Array.isArray(list) ? list : [])
      setPageInfo(paging || {})
    } catch (error) {
      setError(error.message)
      alert("정보 가져오기 실패")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page !== pageInfo.nowPage) getData(page)
  }

  const handleDelete = async (g_idx) => {
    if (!window.confirm("정말로 이 방명록을 삭제하시겠습니까?")) return
    try {
      await guestBookDelete(g_idx)
      alert("방명록이 성공적으로 삭제되었습니다.")
      getData(pageInfo.nowPage)
    } catch (error) {
      setError(error.message)
      alert(`삭제 실패: ${error.message}`)
    }
  }
 
  useEffect(() => {
    getData(1)
  }, [])
 
  if (loading) return <div className="admin-loading">로딩 중</div>
  if (error) return <div className="admin-error">{error}</div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">방명록 관리</h1>
        <p className="admin-desc">방명록을 확인하고 관리합니다 (총 {pageInfo.totalRecord}건)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>방명록 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>번호</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>내용</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guestList.length > 0 ? guestList.map((entry, index) => (
                <TableRow key={entry.g_idx}>
                  <TableCell className="cell-strong">{((pageInfo.nowPage - 1) * pageInfo.numPerPage) + index + 1}</TableCell>
                  <TableCell className="cell-strong">{entry.g_writer}</TableCell>
                  <TableCell className="cell-content">{entry.g_content}</TableCell>
                  <TableCell>{entry.g_writedate?.substring(0, 10)}</TableCell>
                  <TableCell className="cell-right">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(entry.g_idx)}>
                      <Trash2 className="icon-delete" />삭제
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="no-data">등록된 방명록이 없습니다.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {pageInfo.totalPage > 1 && (
            <div className="paging-wrap">
              <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
