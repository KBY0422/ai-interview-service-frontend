import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Bell, Eye, Megaphone } from "lucide-react"
import { noticePageList } from "../../api/Auth"
import Pagination from "../../components/ui/Paging"

import "../../styles/notice/NoticePage.css"

export default function NoticePage() {
  const [noticeList, setNoticeList] = useState([])
  const [pageInfo, setPageInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const location = useLocation()

  const getData = async (currentPage) => {
    try {
      setLoading(true)

      const response = await noticePageList({ nowPage: currentPage })
      const list = response.data?.data?.noticelist
      const paging = response.data?.data?.paging

      setNoticeList(Array.isArray(list) ? list : [])
      if (paging) {
        setPageInfo({ ...paging, nowPage: currentPage })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page !== pageInfo.nowPage) {
      getData(page)
    }
  }

  useEffect(() => {
    const page = location.state?.nowPage || 1
    getData(page)
  }, [location.state?.nowPage])

  if (loading) return <div className="notice-center">로딩 중</div>
  if (error) return <div className="notice-center error">{error}</div>

  return (
    <div className="notice-page" style={{marginTop:"64px"}}>

      <main className="notice-main">
        <div className="notice-wrapper">
          <div className="notice-header">
            <h1 className="notice-title">
              <Bell className="notice-icon" />
              공지사항
            </h1>
            <p className="notice-sub text-main">
              AI-InterView의 새로운 소식을 확인하세요 (총 {pageInfo.totalRecord}개)
            </p>
          </div>

          <div className="notice-list">
            {noticeList.map((entry) => (
              <Link key={entry.n_idx} to={`/notice/${entry.n_idx}`}>
                {/* n_pin 값에 따라 'pinned' 클래스 추가 */}
                <Card className={`notice-card ${entry.n_pin === "1" ? "pinned" : ""}`}>
                  <CardContent className="notice-card-content">
                    <div className="notice-row">
                      <h3 className="notice-item-title text-main">
                        {/* 고정글일 경우 아이콘과 뱃지 표시 */}
                        {entry.n_pin === "1" && (
                          <span className="notice-pin-badge">
                            <Megaphone size={14} className="mr-1" />
                            중요
                          </span>
                        )}
                        {entry.n_title}
                      </h3>

                      <div className="notice-meta text-main">
                        <span className="notice-hit">
                          <Eye className="notice-eye" />
                          {entry.n_hit}
                        </span>
                        <span>
                          {entry.n_writedate.substring(0, 10)}
                        </span>
                      </div>
                    </div>
 
                    <p className="notice-content text-main">
                      {entry.n_content.substring(0, 100)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
 
      {pageInfo.totalPage > 1 && (
        <div className="notice-pagination">
          <Pagination
            pageInfo={pageInfo}
            handlePageChange={handlePageChange}
          />
        </div>
      )}

    </div>
  )
}
