import { useCallback, useEffect, useState } from "react";
import { adminDeleteJob, adminDeleteSkill, adminWriteJobList, adminWriteSkillList, getJobList, getSkillList } from "../../api/OpenAiGpt";
import "../../styles/AdminInterviewSetting.css";

export default function AdminInterviewSetting() {
    // --- 상태 관리 ---
    const [jobInputs, setJobInput] = useState([]);
    const [jobIdCounter, setJobIdCounter] = useState(1);
    const [skillInputs, setSkillInput] = useState([]);
    const [skillIdCounter, setSkillIdCounter] = useState(1);

    const [dbJobList, setDbJobList] = useState([]);
    const [viewType, setViewType] = useState("job");
    const [viewList, setViewList] = useState([]);

    // 기술 스택 필터링 상태
    const [selectedJobFilter, setSelectedJobFilter] = useState("all");

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // --- 데이터 로딩 로직 ---
    const loadJobs = useCallback(async () => {
        try {
            const response = await getJobList();
            if (response.data.success) {
                setDbJobList(response.data.data);
                if (viewType === "job") {
                    setViewList(response.data.data);
                }
            }
        } catch (error) {
            console.error("Job 항목 불러오기 실패");
        }
    }, [viewType]);

    const loadSkill = useCallback(async () => {
        try {
            const response = await getSkillList();
            if (response.data.success) {
                setViewList(response.data.data);
            }
        } catch (error) {
            console.error("Skill 로드 실패");
        }
    }, []);

    // 필터링된 리스트 계산
    const filteredList = viewType === "skill" && selectedJobFilter !== "all" ? viewList.filter((item) => item.e_skill_job === selectedJobFilter) : viewList;

    // --- 이벤트 핸들러 ---
    const handleViewChange = async (e) => {
        const type = e.target.value;
        setViewType(type);
        setSelectedJobFilter("all");

        if (type === "job") {
            await loadJobs();
        } else {
            await loadJobs();
            await loadSkill();
        }
    };

    const openDeleteModal = (item) => {
        setDeleteTarget(item);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
        setIsModalOpen(false);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const isJob = viewType === "job";
            const idx = isJob ? deleteTarget.e_job_idx : deleteTarget.e_skill_idx;

            const response = isJob ? await adminDeleteJob(idx) : await adminDeleteSkill(idx);

            if (response.data.success) {
                isJob ? loadJobs() : loadSkill();
            }
        } catch (error) {
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            closeDeleteModal();
        }
    };

    const handleJobAdd = () => {
        setJobInput([...jobInputs, { id: jobIdCounter, value: "" }]);
        setJobIdCounter(jobIdCounter + 1);
    };
    const handleJobInputChange = (id, e) => {
        setJobInput(jobInputs.map((k) => (k.id === id ? { ...k, value: e.target.value } : k)));
    };
    const handleJobDelete = (id) => {
        setJobInput(jobInputs.filter((k) => k.id !== id));
    };

    const handleSkillAdd = () => {
        setSkillInput([...skillInputs, { id: skillIdCounter, jobId: "", value: "" }]);
        setSkillIdCounter(skillIdCounter + 1);
    };
    const handleSkillInputChange = (id, field, val) => {
        setSkillInput((prev) => prev.map((k) => (k.id === id ? { ...k, [field]: val } : k)));
    };
    const handleSkillDelete = (id) => {
        setSkillInput(skillInputs.filter((k) => k.id !== id));
    };

    const handleJobSave = async () => {
        const jobValues = jobInputs.map((k) => ({ e_job: k.value.trim() })).filter((obj) => obj.e_job.length > 0);
        if (jobValues.length === 0) return alert("입력한 항목이 없습니다.");
        const response = await adminWriteJobList(jobValues);
        if (response.data.success) {
            alert("등록 성공");
            setJobInput([]);
            loadJobs();
        }
    };

    const handleSkillSave = async () => {
        const skillValues = skillInputs
            .filter((k) => k.jobId !== "" && k.value.trim().length > 0)
            .map((k) => ({ e_skill_job: k.jobId, e_skill: k.value.trim() }));
        if (skillValues.length === 0) return alert("입력한 항목이 없습니다.");
        const response = await adminWriteSkillList(skillValues);
        if (response.data.success) {
            alert("등록 성공");
            setSkillInput([]);
            if (viewType === "skill") loadSkill();
        }
    };

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    return (
        <div className="page-container">
            <div className="header-section">
                <h1 className="main-title">면접 옵션 관리</h1>
                <p className="subtitle">관리자용 직군 및 기술 스택 설정 페이지입니다.</p>
            </div>

            <div className="grid-layout">
                {/* 직군 추가 카드 */}
                <div className="card-box">
                    <div className="card-header">
                        <h2 className="card-title">새 직군 추가</h2>
                    </div>
                    <div className="card-content">
                        {jobInputs.map((k) => (
                            <div key={k.id} className="input-with-delete">
                                <input className="dynamic-input" value={k.value} onChange={(e) => handleJobInputChange(k.id, e)} placeholder="직군명 입력" />
                                <button onClick={() => handleJobDelete(k.id)} className="delete-button">
                                    X
                                </button>
                            </div>
                        ))}
                        <div className="btn">
                            <button className="primary-add-button" onClick={handleJobAdd}>
                                + 추가
                            </button>
                            <button className="primary-save-button" onClick={handleJobSave}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>

                {/* 기술 스택 추가 카드 */}
                <div className="card-box">
                    <div className="card-header">
                        <h2 className="card-title">새 기술 스택 추가</h2>
                    </div>
                    <div className="card-content">
                        {skillInputs.map((k) => (
                            <div key={k.id} className="input-with-delete skill-input-row">
                                <select className="job-select" value={k.jobId} onChange={(e) => handleSkillInputChange(k.id, "jobId", e.target.value)}>
                                    <option value="">직군 선택</option>
                                    {dbJobList.map((job) => (
                                        <option key={job.e_job_idx} value={job.e_job}>
                                            {job.e_job}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className="dynamic-input skill-name-input"
                                    value={k.value}
                                    onChange={(e) => handleSkillInputChange(k.id, "value", e.target.value)}
                                    placeholder="기술명 입력"
                                />
                                <button onClick={() => handleSkillDelete(k.id)} className="delete-button">
                                    X
                                </button>
                            </div>
                        ))}
                        <div className="btn">
                            <button className="primary-add-button" onClick={handleSkillAdd}>
                                + 추가
                            </button>
                            <button className="primary-save-button" onClick={handleSkillSave}>
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 테이블 목록 영역 */}
            <div className="card-box">
                <div className="card-header header-flex">
                    <h2 className="card-title">등록된 요소 목록</h2>

                    <div className="filter-group">
                        {viewType === "skill" && (
                            <select className="form-select w-auto" value={selectedJobFilter} onChange={(e) => setSelectedJobFilter(e.target.value)}>
                                <option value="all">모든 직군</option>
                                {dbJobList.map((job) => (
                                    <option key={job.e_job_idx} value={job.e_job}>
                                        {job.e_job}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select className="form-select w-auto" value={viewType} onChange={handleViewChange}>
                            <option value="job">직군</option>
                            <option value="skill">기술 스택</option>
                        </select>
                    </div>
                </div>

                <div className="card-content">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="table-head">번호</th>
                                <th className="table-head">직종</th>
                                {viewType === "skill" && <th className="table-head">기술 스택</th>}
                                <th className="table-head right-align">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map((item, index) => (
                                <tr className="table-row" key={index}>
                                    <td className="table-cell">{index + 1}</td>
                                    <td className="table-cell">{viewType === "job" ? item.e_job : item.e_skill_job}</td>
                                    {viewType === "skill" && <td className="table-cell">{item.e_skill}</td>}
                                    <td className="table-cell right-align">
                                        <button className="destructive-button icon-button" onClick={() => openDeleteModal(item)}>
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredList.length === 0 && <div className="empty-data-message">데이터가 존재하지 않습니다.</div>}
                </div>
            </div>

            {/* 삭제 확인 모달 */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>정말 삭제하시겠습니까?</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                <strong>{viewType === "job" ? deleteTarget?.e_job : deleteTarget?.e_skill}</strong> 항목을 삭제합니다.
                                <br />이 작업은 되돌릴 수 없습니다.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-button secondary" onClick={closeDeleteModal}>
                                취소
                            </button>
                            <button className="modal-button danger" onClick={confirmDelete}>
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
