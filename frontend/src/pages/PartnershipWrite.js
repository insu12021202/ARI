import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { customAxios } from "./customAxios";
import Loading from "../components/Loading";
import { BiEditAlt } from "react-icons/bi";
import { Container } from "../components/common/Container";
import { Intro } from "../components/common/Intro";
import { RightButton } from "../components/common/Button";
import { Period, Textarea } from "../components/store/PartnershipStyle";

const PartnershipWrite = () => {
  const [fromStores, setFromStores] = useState([]);
  const [storeIndex, setStoreIndex] = useState("-1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  // 협약 신청자의 가게 리스트 받아오기
  const getFromStoreList = async () => {
    try {
      const { data } = await customAxios.get("/owner/partnership/store-list");

      setFromStores(data.data);
      setIsLoading(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFromStoreList();
  }, []);

  const partnershipRequest = async () => {
    try {
      await customAxios.post("/owner/partnership/request", {
        content,
        startDate: startDate.replace(/-/g, "/"),
        endDate: endDate.replace(/-/g, "/"),
        fromStoreId: fromStores[storeIndex].storeId,
        toStoreId: state.storeId,
        articleId: parseInt(state.articleId),
      });

      alert("협약이 성공적으로 요청되었습니다.");
      navigate("/partnership");
    } catch (e) {
      console.log(e);
    }
  };

  if (!isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header text="협약 제휴 작성" back={true}></Header>
      <Container>
        <div
          style={{ boxSizing: "border-box", width: "375px", padding: "25px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "18px",
              borderBottom: "1px solid #dbdbdb",
              paddingBottom: "15px",
            }}
          >
            <Intro>작성자 가게 선택</Intro>
            <select
              style={{ textAlign: "center" }}
              onChange={(e) => setStoreIndex(e.target.value)}
            >
              <option value="-1">--선택하세요--</option>
              {fromStores &&
                fromStores.map((store, index) => {
                  return (
                    <option key={index} value={index}>
                      {store.storeName}
                    </option>
                  );
                })}
            </select>
          </div>
          <Intro>제휴 기간</Intro>
          <Period>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            ></input>
            <span style={{ margin: "0 5px" }}>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            ></input>
          </Period>
          <Intro>제휴 내용</Intro>
          <div style={{ position: "relative" }}>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="(XXX가게 영수증 지참 후 우리 가게 방문 시, A메뉴 10% 할인)"
              maxLength="152"
            ></Textarea>
            <BiEditAlt
              color="#A3A3A3"
              size="22"
              style={{
                position: "absolute",
                right: "0",
                bottom: "6px",
                padding: "16px",
              }}
            />
          </div>
          <RightButton
            onClick={partnershipRequest}
            disabled={
              storeIndex !== "-1" && startDate !== "" && endDate !== ""
                ? false
                : true
            }
          >
            협약 등록
          </RightButton>
        </div>
      </Container>
    </>
  );
};

export default PartnershipWrite;
