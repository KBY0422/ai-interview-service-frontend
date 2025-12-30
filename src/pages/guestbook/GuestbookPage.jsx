import { Link, useLocation } from "react-router-dom"
import { Button } from "../../components/ui/button.jsx"
import { Card, CardContent } from "../../components/ui/card.jsx"
//import { Avatar, AvatarFallback } from "../../components/ui/avatar.jsx"
import { BookOpen, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { guestBookPageList } from "../../api/Auth.jsx"
import Pagination from "../../components/ui/Paging.jsx"

import "../../styles/guestbook/GuestbookPage.css"

export default function GuestbookPage() {
  const [guestList, setGuestList] = useState([])
  const [pageInfo, setPageInfo] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  
  const getData = async (currentPage) => {
    try {
      setLoading(true)
      const response = await guestBookPageList({ nowPage: currentPage })
      const list = response.data?.data?.guestlist
      const paging = response.data?.data?.paging

      setGuestList(Array.isArray(list) ? list : [])
      if (paging) {
        setPageInfo({ ...paging, nowPage: currentPage })
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage !== pageInfo.nowPage && newPage >= 1 && newPage <= pageInfo.totalPage) {
      getData(newPage)
    }
  }

  useEffect(() => {
    const page = location.state?.nowPage || 1
    getData(page)
  }, [location.state?.nowPage])

  if (loading) return <div className="center-text">로딩 중</div>
  if (error) return <div className="center-text error">{error}</div>

  return (
    <div className="guestbook-page" style={{marginTop:"64px"}}>
      

      <main className="guestbook-main">
        <div className="guestbook-wrapper">
          <div className="guestbook-header">
            <div>
              <h1 className="guestbook-title">
                <BookOpen className="guestbook-title-icon" />
                방명록
              </h1>
              <p className="guestbook-desc text-main">AI-InterView에 대한 의견을 남겨주세요 (총 {pageInfo.totalRecord}개)</p>
            </div>
            <Link to="/guestbook/write">
              <Button className="write-button primary">
                <Plus className="write-icon" />
                작성하기
              </Button>
            </Link>
          </div>

          <div className="guestbook-list">
            {guestList.length > 0 ? guestList.map((entry) => (
              <Link
                key={entry.g_idx}
                to={`/guestbook/${entry.g_idx}`}
                state={{ fromPage: pageInfo.nowPage }}
                className="guestbook-item"
              >
                <Card>
                  <CardContent className="guestbook-card">
                    <div className="guestbook-item-inner">
                      {/* <Avatar>
                        <AvatarFallback className="avatar-fallback">{entry.g_writer[0]}</AvatarFallback>
                      </Avatar> */}
                      <div className="guestbook-item-content text-main">
                        <div className="guestbook-item-header">
                          <h3 className="guestbook-writer">{entry.g_writer}</h3>
                          <span className="guestbook-date text-main" >{entry.g_writedate.substring(0, 10)}</span>
                        </div>
                        <p className="guestbook-title-text text-main">{entry.g_title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <div className="no-data">등록된 방명록 글이 없습니다.</div>
            )}
          </div>
        </div>
      </main>

      {pageInfo.totalPage > 1 && (
        <div className="paging-container">
          <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange} />
        </div>
      )}

    
    </div>
  )
}
