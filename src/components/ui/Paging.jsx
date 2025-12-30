import { Button } from "./button"; // Button 컴포넌트 경로 가정
import { cn } from "../../lib/utils"; // cn 유틸리티 함수 경로 가정
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * 페이지네이션 컴포넌트
 * @param {object} pageInfo - 페이지 정보 VO 객체 (nowPage, totalPage, beginBlock, endBlock, pagePerBlock 포함)
 * @param {function} handlePageChange - 페이지 변경 처리 함수
 */
const Pagination = ({ pageInfo, handlePageChange }) => {
    // pageInfo가 없거나 totalPage가 1 이하면 렌더링하지 않음
    if (!pageInfo || pageInfo.totalPage <= 1) {
        return null;
    }

    // 현재 블록에 표시할 페이지 번호 배열을 생성
    const getPageNumbers = () => {
        const pages = [];
        // beginBlock부터 endBlock까지의 페이지 번호를 배열에 추가
        // 주의: 백엔드에서 beginBlock과 endBlock을 정확히 계산하여 전달해야 합니다.
        for (let i = pageInfo.beginBlock; i <= pageInfo.endBlock; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            {/* 1. 맨 처음 페이지 버튼 (<<) */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(1)}
                disabled={pageInfo.nowPage === 1}
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* 2. 이전 블록 버튼 (<) */}
            <Button
                variant="outline"
                size="icon"
                // 이전 블록의 첫 페이지로 이동
                onClick={() => handlePageChange(pageInfo.beginBlock - pageInfo.pagePerBlock)}
                disabled={pageInfo.beginBlock <= 1} 
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* 3. 페이지 번호 목록 */}
            {pageNumbers.map((page) => (
                <Button
                    key={page}
                    // 현재 페이지는 'default' 스타일로 강조
                    variant={page === pageInfo.nowPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={cn(
                        "w-10 h-10",
                        page === pageInfo.nowPage ? "bg-primary primary" : "hover:bg-muted"
                    )}
                >
                    {page}
                </Button>
            ))}

            {/* 4. 다음 블록 버튼 (>) */}
            <Button
                variant="outline"
                size="icon"
                // 다음 블록의 첫 페이지로 이동
                onClick={() => handlePageChange(pageInfo.endBlock + 1)}
                disabled={pageInfo.endBlock >= pageInfo.totalPage} 
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* 5. 맨 끝 페이지 버튼 (>>) */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pageInfo.totalPage)}
                disabled={pageInfo.nowPage === pageInfo.totalPage || pageInfo.totalPage === 0}
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

// 외부에서 이 컴포넌트를 import하여 사용할 수 있도록 export 합니다.
export default Pagination;