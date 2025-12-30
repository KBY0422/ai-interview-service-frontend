import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { HelpCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { inqueryPageList } from "../../api/Auth.jsx";
import Pagination from "../../components/ui/Paging";

import "../../styles/inquery/InquiryPage.css";

export default function InquiryPage() {
  const [inqueryList, setInqueryList] = useState([]);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({});

  const getData = async (currentPage) => {
    try {
      setLoading(true);
      const response = await inqueryPageList({ nowPage: currentPage });

      const list = response.data?.data?.inquerylist;
      const fetchedPageInfo = response.data?.data?.paging;

      setInqueryList(Array.isArray(list) ? list : []);
      if (fetchedPageInfo) {
        setPageInfo({
          ...fetchedPageInfo,
          nowPage: currentPage,
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (
      newPage !== pageInfo.nowPage &&
      newPage >= 1 &&
      newPage <= pageInfo.totalPage
    ) {
      getData(newPage);
    }
  };

  useEffect(() => {
    const page = location.state?.nowPage || 1;
    getData(page);
  }, [location.state?.nowPage]);

  if (loading) return <div className="inquiry-loading">로딩 중</div>;
  if (error) return <div className="inquiry-error">{error}</div>;

  return (
    <div className="inquiry-page" style={{marginTop:"64px"}}>
  
      <main className="inquiry-main">
        <div className="inquiry-container">
          {/* 타이틀 */}
          <div className="inquiry-header">
            <div>
              <h1 className="inquiry-title">
                <HelpCircle className="inquiry-icon" />
                문의사항 / 고객의소리
              </h1>
              <p className="inquiry-subtitle text-main">
                궁금한 점을 문의 또는 불편한 점을 건의 해주세요
                (총 {pageInfo.totalRecord}개)
              </p>
            </div>
 
            <Link to="/inquery/write">
              <Button className="inquiry-write-btn primary">
                <Plus size={16} />
                문의하기
              </Button>
            </Link>
          </div>

          {/* 리스트 */}
          <div className="inquiry-list">
            {inqueryList.map((entry) => (
              <Link key={entry.i_idx} to={`/inquery/${entry.i_idx}`}>
                <Card className="inquiry-card" >
                  <CardContent className="inquiry-card-content">
                    <div className="inquiry-card-top">
                      <div className="inquiry-left">
                        <div className="inquiry-title-row">
                          <h3 className="inquiry-card-title">
                            {entry.i_title}
                          </h3>

                          <span
                            className={`status ${
                              entry.i_reply === "1"
                                ? "status-wait"
                                : "status-done"
                            }`}
                          >
                            {entry.i_reply === "1"
                              ? "응답대기"
                              : "답변완료"}
                          </span>
                        </div>

                        <p className="inquiry-writer text-main">
                          {entry.i_writer}
                        </p>

                        <p className="inquiry-preview text-main">
                          {entry.i_content.substring(0, 50)}
                        </p>
                      </div>

                      <div className="inquiry-right">
                        <span className="inquiry-date text-main">
                          {entry.i_writedate.substring(0, 10)}
                        </span>

                        <span
                          className={`category ${
                            entry.i_category === "1"
                              ? "category-qna"
                              : "category-voice"
                          }`}
                        >
                          {entry.i_category === "1"
                            ? "문의하기"
                            : "고객의소리"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {pageInfo.totalPage > 1 && (
        <div className="inquiry-pagination">
          <Pagination
            pageInfo={pageInfo}
            handlePageChange={handlePageChange}
          />
        </div>
      )}

    </div>
  );
}
