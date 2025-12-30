import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/MyPage.css";
import {
  getMyGuestbooks,
  getMyInquiries,
  myPage,
  quitMember,
  sendQuitMail,
  updateMyInfo,
  verifyQuitCode,
} from "../../api/Auth";
import { getAnalysisList } from "../../api/api";
import useAuthStore from "../../store/AuthStore";

export default function MyPage() {
  const navigate = useNavigate();
  const { zu_logout } = useAuthStore();
  const [form, setForm] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [guestbooks, setGuestbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quitEmail, setQuitEmail] = useState("");
  const [quitCode, setQuitCode] = useState("");
  const [quitVerified, setQuitVerified] = useState(false);
  const [quitLoading, setQuitLoading] = useState(false);

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        const res = await myPage();
        if (res.data.success) {
          setForm({
            m_name: res.data.data.m_name ?? "",
            m_id: res.data.data.m_id ?? "",
            m_addr1: res.data.data.m_addr1 ?? "",
            m_addr2: res.data.data.m_addr2 ?? "",
            m_email: res.data.data.m_email ?? "",
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchInterviews = async () => {
      try {
        const res = await getAnalysisList();
        console.log(res);
        if (res?.data?.success) {
          setInterviews(res.data.data ?? []);
        } else {
          setInterviews([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchInquiries = async () => {
      try {
        const res = await getMyInquiries();
        setInquiries(res.data.data ?? []);
      } catch (e) {
        console.error(e);
      }
    };

    const fetchGuestbooks = async () => {
      try {
        const res = await getMyGuestbooks();
        setGuestbooks(res.data.data ?? []);
      } catch (e) {
        console.error(e);
      }
    };

    Promise.all([
      fetchMyPage(),
      fetchInterviews(),
      fetchInquiries(),
      fetchGuestbooks(),
    ]).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddrFind = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm((prev) => ({
          ...prev,
          m_addr1: data.address,
        }));
      },
    }).open();
  };

  const handleUpdate = async () => {
    try {
      const response = await updateMyInfo(form);
      if (response.data.success) {
        alert("개인정보 변경 성공");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendQuitMail = async () => {
    if (!quitEmail) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (quitEmail !== form.m_email) {
      alert("회원 정보의 이메일과 일치하지 않습니다.");
      return;
    }

    try {
      setQuitLoading(true);
      await sendQuitMail({ email: quitEmail });
      alert("인증메일이 발송되었습니다.");
    } catch (e) {
      alert("메일 발송 실패");
    } finally {
      setQuitLoading(false);
    }
  };

  const handleVerifyQuitCode = async () => {
    try {
      const res = await verifyQuitCode({ code: quitCode });
      if (res.data.success) {
        setQuitVerified(true);
        alert("인증 완료");
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (e) {
      alert("인증 실패");
    }
  };

  const handleQuit = async () => {
    if (!quitVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    if (!window.confirm("정말 회원 탈퇴하시겠습니까?")) return;

    try {
      await quitMember(); // 회원 탈퇴 API
       localStorage.removeItem("tokens");
       zu_logout();
       alert("회원 탈퇴가 완료되었습니다.");
     
       navigate("/login", { replace: true });
      
    } catch (e) {
      alert("회원 탈퇴 실패");
    }
  };

  if (loading) {
    return <div className="mypage-container">로딩 중...</div>;
  }

  if (!form) {
    return (
      <div className="mypage-container">회원 정보를 불러올 수 없습니다.</div>
    );
  }

  return (
    <div className="mypage-container">
      <main className="mypage-main">
        <h1 className="mypage-title">마이페이지</h1>

        <Tabs defaultValue="profile" className="mypage-tabs">
          <TabsList className="mypage-tabs-list">
            <TabsTrigger value="profile">개인정보</TabsTrigger>
            <TabsTrigger value="interviews">면접 기록</TabsTrigger>
            <TabsTrigger value="inquiries">문의내역</TabsTrigger>
            <TabsTrigger value="guestbooks">방명록</TabsTrigger>
            <TabsTrigger value="quit">회원 탈퇴</TabsTrigger>
          </TabsList>

          {/* 개인정보 수정 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>개인정보 수정</CardTitle>
                <CardDescription>
                  회원 정보를 수정할 수 있습니다
                </CardDescription>
              </CardHeader>

              <CardContent className="mypage-form-area">
                <div className="mypage-input-group">
                  <label htmlFor="name">이름</label>
                  <Input
                    id="name"
                    name="m_name"
                    value={form.m_name}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="mypage-input-group">
                  <label htmlFor="username">아이디</label>
                  <Input id="username" name="m_id" value={form.m_id} disabled />
                </div>

                <div className="mypage-input-group">
                  <label htmlFor="addr1">기본 주소</label>
                  <Input
                    id="addr1"
                    name="m_addr1"
                    value={form.m_addr1}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    className="register-outline-btn"
                    onClick={handleAddrFind}
                  >
                    주소 찾기
                  </Button>
                </div>

                <div className="mypage-input-group">
                  <label htmlFor="addr2">상세 주소</label>
                  <Input
                    id="addr2"
                    name="m_addr2"
                    value={form.m_addr2}
                    onChange={handleChange}
                  />
                </div>

                <div className="mypage-input-group">
                  <label htmlFor="email">이메일</label>
                  <Input
                    id="email"
                    type="email"
                    name="m_email"
                    value={form.m_email}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="mypage-btn-row">
                  <button className="mypage-primary-btn" onClick={handleUpdate}>
                    정보 수정
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 면접 기록 */}
          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>나의 면접 기록</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="mypage-list">
                  {interviews.length === 0 ? (
                    <p className="mypage-meta">면접 기록이 없습니다.</p>
                  ) : (
                    interviews.map((item) => (
                      <div key={item.sidx} className="mypage-list-item">
                        <div className="mypage-list-header">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="mypage-meta">{item.date}</p>
                          </div>
                          <span className="mypage-score">
                            {item.totalScore}점
                          </span>
                        </div>

                        <Link to={`/analysis/result/${item.sidx}`}>
                          <Button variant="outline" size="sm">
                            피드백 보기
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 문의 내역 */}
          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>나의 문의내역</CardTitle>
                <CardDescription>등록한 문의사항 목록입니다</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mypage-list">
                  {inquiries.map((item) => (
                    <Link
                      key={item.i_idx}
                      to={`/inquery/${item.i_idx}`}
                      className="block"
                    >
                      <div className="mypage-simple-item">
                        <div className="mypage-list-header">
                          <h3 className="font-semibold">{item.i_title}</h3>
                          <span className="mypage-status-tag">
                            {item.i_reply === "1" ? "응답대기" : "답변완료"}
                          </span>
                        </div>
                        <p className="mypage-meta">{item.i_writer}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 방명록 */}
          <TabsContent value="guestbooks">
            <Card>
              <CardHeader>
                <CardTitle>나의 방명록</CardTitle>
                <CardDescription>작성한 방명록 목록입니다</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mypage-list">
                  {guestbooks.length === 0 ? (
                    <p className="mypage-meta">방명록이 없습니다.</p>
                  ) : (
                    guestbooks.map((item) => (
                      <Link to={`/guestbook/${item.g_idx}`} className="block">
                        <div key={item.g_idx} className="mypage-simple-item">
                          <div className="mypage-list-header">
                            <h3 className="font-semibold">{item.g_title}</h3>
                          </div>
                          <p className="mypage-meta">{item.g_writedate}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 회원 탈퇴 */}
          <TabsContent value="quit">
            <Card>
              <CardHeader>
                <CardTitle>회원 탈퇴</CardTitle>
                <CardDescription>
                  탈퇴 시 모든 정보는 복구할 수 없습니다.
                </CardDescription>
              </CardHeader>

              <CardContent className="mypage-form-area">
                <div className="mypage-input-group">
                  <label>이메일</label>
                  <Input
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={quitEmail}
                    onChange={(e) => setQuitEmail(e.target.value)}
                  />
                  <Button
                    className="mypage-outline-btn primary"
                    onClick={handleSendQuitMail}
                    disabled={quitLoading}
                  >
                    인증메일 발송
                  </Button>
                </div>

                <div className="mypage-input-group">
                  <label>인증번호</label>
                  <Input
                    value={quitCode}
                    onChange={(e) => setQuitCode(e.target.value)}
                    disabled={quitVerified}
                  />
                  <Button
                    onClick={handleVerifyQuitCode}
                    disabled={!quitCode || quitVerified}
                    className="mypage-outline-btn primary"
                  >
                    인증하기
                  </Button>
                  {quitVerified && (
                    <p className="text-green-600 text-sm">
                      인증이 완료되었습니다.
                    </p>
                  )}
                </div>

                <div className="mypage-btn-row">
                  <Button
                    className="mypage-outline-btn primary"
                    onClick={handleQuit}
                    disabled={!quitVerified}
                  >
                    회원 탈퇴
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
