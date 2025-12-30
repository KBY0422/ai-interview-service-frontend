import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Search, UserX } from "lucide-react";

import {
  AdminUserControl,
  AdminUserStatusUpdate,
} from "../../api/api";
import { useEffect, useState, useCallback } from "react";

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [keyword, setKeyword] = useState("");

  // 페이징
  const [page, setPage] = useState(1);
  const size = 10;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / size);

  const [loading, setLoading] = useState(false);

  /**
   * 회원 목록 조회
   * - 토큰 없을 경우 API 호출만 차단
   * - 렌더는 정상적으로 유지
   */
  const fetchMembers = useCallback(
    async (pageNum = page) => {
      
      setLoading(true);
      try {
        const res = await AdminUserControl(pageNum, size, keyword);
        setMembers(res.data.list);
        setTotalCount(res.data.totalCount);
      } finally {
        setLoading(false);
      }
    },
    [page, size, keyword]
  );

  /**
   * 페이지 변경 시 조회
   * - 토큰 준비 전에는 호출하지 않음
   */
  useEffect(() => {

    fetchMembers(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchMembers]);

  /**
   * 검색
   */
  const onSearch = () => {
    setPage(1);
    fetchMembers(1);
  };

  /**
   * 회원 정지
   */
  const onBlock = async (mIdx) => {
    if (!window.confirm("정말 이 회원을 정지하시겠습니까?")) return;
    await AdminUserStatusUpdate(mIdx, 0);
    fetchMembers();
  };

  /**
   * 회원 활성화
   */
  const onActivate = async (mIdx) => {
    if (!window.confirm("이 회원을 다시 활성화하시겠습니까?")) return;
    await AdminUserStatusUpdate(mIdx, 1);
    fetchMembers();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">회원 관리</h1>
        <p className="text-muted-foreground">
          전체 회원 정보를 관리합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>회원 목록</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="회원 검색..."
                className="w-64"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch();
                  }
                }}
              />
              <Button variant="outline" onClick={onSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>번호</TableHead>
                <TableHead>아이디</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>탈퇴일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    불러오는 중...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-40" />
                      <span>
                        {keyword
                          ? "검색 결과가 없습니다."
                          : "등록된 회원이 없습니다."}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.midx}>
                    <TableCell>{member.midx}</TableCell>
                    <TableCell className="font-medium">
                      {member.mid}
                    </TableCell>
                    <TableCell>
                      {member.mregdate?.slice(0, 10)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          member.mactive === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {member.mactive === 1 ? "활성" : "정지"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.mdregdate
                        ? member.mdregdate.slice(0, 10)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(member.mactive) === 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onBlock(member.midx)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          정지
                        </Button>
                      )}
                      {Number(member.mactive) === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onActivate(member.midx)}
                        >
                          복구
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              ⏮
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ◀
            </Button>
            <span className="px-3 py-1 text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ▶
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
            >
              ⏭
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
