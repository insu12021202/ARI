import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import DaumPostcode from "react-daum-postcode";
import { customAxios } from "./customAxios";
import Loading from "../components/Loading";
import { HiOutlineCamera, HiPlus } from "react-icons/hi";
import { BiEditAlt } from "react-icons/bi";
import {
  Container,
  SpaceBetweenContainer,
} from "../components/common/Container";
import Formbox from "../components/common/FormBox";
import { HalfButton, SendButton } from "../components/common/Button";
import {
  Intro,
  Box,
  Input,
  Textarea,
  UploadImage,
  DeleteImage,
  MainPick,
  Image,
  StoreTap,
  AddStoreTap,
} from "../components/store/StoreInfoStyle";

const StoreInfoEdit = () => {
  // 가게 이름, 가게 주소, 상세 주소, 사장님 성함, 사장님 전화번호, 가게 전화번호, 이미지, 한 줄 소개, 영업 시간
  const [storeInfoArr, setStoreInfoArr] = useState([]);
  const [uStoreId, setuStoreId] = useState(null);
  const [uStoreName, setuStoreName] = useState("");
  const [uRoadAddress, setuRoadAddress] = useState("");
  const [uDetailAddress, setuDetailAddress] = useState("");
  const [uOwnerName, setuOwnerName] = useState("");
  const [uOwnerPhoneNumber, setuOwnerPhoneNumber] = useState("");
  const [uStorePhoneNumber, setuStorePhoneNumber] = useState("");
  const [uImages, setuImages] = useState([]); // base64 인코딩된 문자열이 들어감
  const [uFormImages, setuFormImages] = useState([]); // form data에 담아 보낼 이미지 파일 리스트
  const [uSubText, setuSubText] = useState("");
  const [uOpenHour, setuOpenHour] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storeIndex, setStoreIndex] = useState("0"); // 가게 탭 인덱스
  const navigate = useNavigate();

  const fileRef = useRef([]); // input[type="file"] DOM 요소에 접근하기 위함
  // useRef(null)이면 렌더링 시간차로 인해 스크립트가 먼저 실행되고 DOM 요소를 참조하지 못해서 Cannot read properties of undefined 에러날 수 있음

  const initialEdit = async () => {
    try {
      const { data } = await customAxios.get("/owner/update/store");

      const dataArr = data.data;
      setStoreInfoArr(dataArr);

      // 처음 페이지 렌더링되었을 때 첫 번째 가게에 대한 초기값 세팅
      const initialStore = dataArr[0];
      setuStoreId(initialStore.storeId);
      setuStoreName(initialStore.storeName || "");
      setuRoadAddress(initialStore.roadAddress || "");
      setuDetailAddress(initialStore.detailAddress || "");
      setuOwnerName(initialStore.ownerName || "");
      setuOwnerPhoneNumber(initialStore.phoneNumber || "");
      setuStorePhoneNumber(initialStore.storePhoneNumber || "");
      setuSubText(initialStore.subText || "");
      setuOpenHour(initialStore.openHour || "");

      if (initialStore.existingImages !== undefined) {
        setuImages(
          initialStore.existingImages.map(
            (image) => `data:image/;base64,${image}`
          )
        ); // 미리보기 이미지

        // input[type="file"] 요소에 files props 할당하기
        // 1. base64 이미지 url을 file 객체로 디코딩
        const decodeFilesArr = dataArr[0].existingImages.map((image, index) =>
          base64ToFile(
            `data:image/;base64,${image}`,
            `${dataArr[0].storeId}_${index}.png`
          )
        );

        setuFormImages(decodeFilesArr);

        // 2. DataTransfer 객체를 이용하여 FileList의 값을 변경
        const dataTranster = new DataTransfer();

        decodeFilesArr.forEach((file) => {
          dataTranster.items.add(file);
        });

        // 2-1. document.getElementById('images').prop("files", setFilesArr);
        fileRef.current.files = dataTranster.files;
      }
      setIsLoading(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    initialEdit();
  }, []);

  // 가게 탭 바뀌었을 때 입력폼 초기값 설정
  const onClickStore = (e) => {
    setStoreIndex(e.target.id);

    // 처음 페이지 렌더링되었을 때 첫 번째 가게에 대한 초기값 세팅
    let currentStore = storeInfoArr[e.target.id];
    setuStoreId(currentStore.storeId);
    setuStoreName(currentStore.storeName || "");
    setuRoadAddress(currentStore.roadAddress || "");
    setuDetailAddress(currentStore.detailAddress || "");
    setuOwnerName(currentStore.ownerName || "");
    setuOwnerPhoneNumber(currentStore.phoneNumber || "");
    setuStorePhoneNumber(currentStore.storePhoneNumber || "");
    setuSubText(currentStore.subText || "");
    setuOpenHour(currentStore.openHour || "");

    if (currentStore.existingImages !== undefined) {
      setuImages(
        currentStore.existingImages.map(
          (image) => `data:image/;base64,${image}`
        )
      ); // 미리보기 이미지

      // input[type="file"] 요소에 files props 할당하기
      // 1. base64 이미지 url을 file 객체로 디코딩
      const decodeFilesArr = currentStore.existingImages.map((image, index) =>
        base64ToFile(
          `data:image/;base64,${image}`,
          `${currentStore.storeId}_${index}.png`
        )
      );

      setuFormImages(decodeFilesArr);

      // 2. DataTransfer 객체를 이용하여 FileList의 값을 변경
      const dataTranster = new DataTransfer();

      decodeFilesArr.forEach((file) => {
        dataTranster.items.add(file);
      });

      // 2-1. document.getElementById('images').prop("files", setFilesArr);
      fileRef.current.files = dataTranster.files;
    }
  };

  // 유효성 검사
  const [isStoreName, setIsStoreName] = useState(true);
  const [isAddress, setIsAddress] = useState(true);
  const [isOwnerName, setIsOwnerName] = useState(true);
  const [isOwnerPhoneNumber, setIsOwnerPhoneNumber] = useState(true);

  // daum-postcode api를 팝업처럼 관리하기 위함
  const [isOpenPost, setIsOpenPost] = useState(false);

  const onChangeOpenPost = () => {
    setIsOpenPost(!isOpenPost);
  };

  const onCompletePost = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setuRoadAddress(fullAddress); // 도로명주소
    setIsAddress(true);
    setIsOpenPost(false);
  };

  // 가게 이름
  const onChangeStoreName = (e) => {
    setuStoreName(e.target.value);
    setIsStoreName(true);

    if (e.target.value.trim() === "") {
      setIsStoreName(false);
    }
  };

  // 사장님 성함
  const onChangeOwnerName = (e) => {
    setuOwnerName(e.target.value);
    setIsOwnerName(true);

    if (e.target.value.trim() === "") {
      setIsOwnerName(false);
    }
  };

  // 사장님 전화번호
  const onChangeOwnerPhoneNumber = (e) => {
    const phoneNumberRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    setuOwnerPhoneNumber(e.target.value);

    if (!phoneNumberRegex.test(e.target.value)) {
      setIsOwnerPhoneNumber(false);
    } else {
      setIsOwnerPhoneNumber(true);
    }
  };

  // 가게 대표 사진 (최대 3장)
  const onChangeImage = (e) => {
    const imageArr = e.target.files; // e.target.files에서 넘어온 이미지들을 배열에 저장
    const maxImageLength = 3;
    const maxAddImageCnt = maxImageLength - uFormImages.length; // 새로 추가할 이미지의 최대 업로드 개수

    // 1. 파일 업로드 개수 검증
    if (imageArr.length > maxAddImageCnt) {
      alert("최대 등록 가능한 이미지 개수를 초과했습니다.");
      return;
    }

    // 2. 파일 업로드 시 모든 파일 (*.*) 선택 방지 위해 이미지 type을 한 번 더 검증
    for (let i = 0; i < imageArr.length; i++) {
      if (
        imageArr[i].type !== "image/jpeg" &&
        imageArr[i].type !== "image/jpg" &&
        imageArr[i].type !== "image/png"
      ) {
        alert("JPG 혹은 PNG 확장자의 이미지 파일만 등록 가능합니다.");
        return;
      }
    }

    Array.from(imageArr).forEach((image) => {
      setuFormImages((prev) => [...prev, image]);

      // 이미지 파일 Base64 인코딩: 이미지 미리보기 위함
      const reader = new FileReader();

      reader.readAsDataURL(image); // 파일을 읽고, result 속성에 파일을 나타내는 URL을 저장

      reader.onload = () => {
        // 읽기 완료 시(성공만) 트리거 됨
        setuImages((prev) => [...prev, reader.result]); // reader.result는 preview Image URL임
      };
    });
  };

  // 이미지 삭제: images 배열의 데이터 삭제
  const deleteImage = (e) => {
    // 클릭 안 된 것들로만 배열 만들기
    // 1. 미리보기 이미지
    const newImagesArr = uImages.filter(
      (image, index) => index !== parseInt(e.target.id)
    );
    setuImages(newImagesArr);

    // 2. 실제로 전달할 파일 객체
    const newFormImagesArr = uFormImages.filter(
      (image, index) => index !== parseInt(e.target.id)
    );
    setuFormImages(newFormImagesArr);
  };

  // base64 인코딩되어 받은 이미지 url을 file 객체로 디코딩
  function base64ToFile(base64, fileName) {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    // 이미지와 json 데이터를 함께 전달하기 위해 FormData 객체에 담아서 전달
    const formData = new FormData();

    if (uFormImages.length > 0) {
      // 이미지 파일이 업로드된 경우
      uFormImages.forEach((image) => {
        formData.append("newImages", image); // 이미지 파일 배열 담기
      });
    } else {
      // 업로드된 이미지 파일이 없는 경우
      formData.append("newImages", null);
    }

    formData.append("storeId", storeInfoArr[storeIndex].storeId);
    formData.append("storeName", uStoreName);
    formData.append("roadAddress", uRoadAddress);
    formData.append("detailAddress", uDetailAddress);
    formData.append("ownerName", uOwnerName);
    formData.append("phoneNumber", uOwnerPhoneNumber);
    formData.append("storePhoneNumber", uStorePhoneNumber);
    formData.append("subText", uSubText);
    formData.append("openHour", uOpenHour);

    try {
      await customAxios.post("/owner/update/store", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("수정되었습니다.");
      navigate("/myPageOwner");
    } catch (e) {
      console.log(e);
    }
  };

  if (!isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header
        text="내 가게 정보 수정"
        back={true}
        url={"/myPageOwner"}
      ></Header>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "327px", marginTop: "26px" }}>
          {storeInfoArr.map((store, index) => {
            return index === parseInt(storeIndex) ? (
              <StoreTap
                backgroundColor="#386ffe"
                key={index}
                id={index}
                onClick={onClickStore}
              >
                {store.storeName}
              </StoreTap>
            ) : (
              <StoreTap key={index} id={index} onClick={onClickStore}>
                {store.storeName}
              </StoreTap>
            );
          })}
          <Link to="/storeInfoAdd">
            <AddStoreTap>
              <HiPlus color="#B9B9B9" size="14" />
            </AddStoreTap>
          </Link>
        </div>
      </div>
      <Container>
        <Formbox>
          <Intro>가게 이름:</Intro>
          <Box>
            <Input
              name="storeName"
              value={uStoreName || ""}
              type="text"
              onChange={onChangeStoreName}
              placeholder="가게 이름 입력"
              required
              maxLength="20"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
        <Formbox>
          <Intro>가게 주소:</Intro>
          <Box>
            <Textarea
              name="roadAddress"
              value={uRoadAddress || ""}
              type="text"
              onChange={(e) => setuRoadAddress(e.target.value)}
              placeholder="도로명 주소 검색"
              required
              readOnly
            />
            <SendButton onClick={onChangeOpenPost}>주소 찾기</SendButton>
          </Box>
          <div style={{ width: "260px" }}>
            {isOpenPost ? (
              <DaumPostcode
                className="daumPost"
                autoClose
                onComplete={onCompletePost}
              />
            ) : null}
          </div>
        </Formbox>
        <Formbox>
          <Intro>상세 주소:</Intro>
          <Box>
            <Input
              name="detailAddress"
              value={uDetailAddress || ""}
              type="text"
              onChange={(e) => setuDetailAddress(e.target.value)}
              placeholder="상세 주소 입력"
              maxLength="20"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
        <Formbox>
          <Intro>사장님 성함:</Intro>
          <Box>
            <Input
              name="ownerName"
              value={uOwnerName || ""}
              type="text"
              onChange={onChangeOwnerName}
              placeholder="사장님 성함 입력"
              maxLength="16"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
        <Formbox>
          <Intro>사장님 전화번호:</Intro>
          <Box>
            <Input
              name="phoneNumber"
              value={uOwnerPhoneNumber || ""}
              type="text"
              onChange={onChangeOwnerPhoneNumber}
              placeholder="010-xxxx-xxxx"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
        <Formbox>
          <Intro>가게 전화번호:</Intro>
          <Box>
            <Input
              name="storePhoneNumber"
              value={uStorePhoneNumber || ""}
              type="text"
              onChange={(e) => setuStorePhoneNumber(e.target.value)}
              placeholder="010-xxxx-xxxx"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
        <Formbox>
          <Intro>
            가게 대표 사진
            <span style={{ fontSize: "15px" }}>&#40;최대 3장&#41;</span>:
          </Intro>
          <Box>
            <input
              style={{ display: "none" }}
              type="file"
              name="images"
              id="images"
              multiple
              accept="image/jpg, image/jpeg, image/png"
              onChange={onChangeImage}
              ref={fileRef}
            />
            <div style={{ display: "flex", marginBottom: "6px" }}>
              <label htmlFor="images">
                <UploadImage>
                  <HiOutlineCamera
                    size={"1.7em"}
                    style={{ paddingTop: "3px" }}
                  />
                  <span style={{ fontSize: "14px" }}>
                    <span style={{ color: "#386FFE" }}>
                      {uFormImages.length}
                    </span>
                    /3
                  </span>
                </UploadImage>
              </label>
              {uImages &&
                uImages.map((image, index) => (
                  <div
                    key={index}
                    style={{ position: "relative", marginRight: "9px" }}
                  >
                    <Image alt="" src={image} id={index} />
                    {index === 0 && <MainPick>대표 사진</MainPick>}
                    <DeleteImage id={index} onClick={deleteImage} />
                  </div>
                ))}
            </div>
          </Box>
        </Formbox>
        <Formbox>
          <Intro>가게 한 줄 소개:</Intro>
          <Box>
            <Textarea
              height="26px"
              name="subText"
              value={uSubText || ""}
              type="text"
              onChange={(e) => setuSubText(e.target.value)}
              placeholder="가게 한 줄 소개 입력"
              maxLength="250"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
        <Formbox>
          <Intro>영업 시간:</Intro>
          <Box>
            <Input
              name="openHour"
              value={uOpenHour || ""}
              type="text"
              onChange={(e) => setuOpenHour(e.target.value)}
              placeholder="오전 9:00 ~ 오후 9:00 (연중무휴)"
              maxLength="30"
            />
            <BiEditAlt color="#A3A3A3" size="22" />
          </Box>
        </Formbox>
      </Container>
      <div style={{ width: "327px", margin: "0 auto" }}>
        <SpaceBetweenContainer>
          <Link to="/myPageOwner">
            <HalfButton backgroundColor="#a3a3a3" type="button">
              취소
            </HalfButton>
          </Link>
          <HalfButton
            backgroundColor="#386ffe"
            onClick={onSubmit}
            disabled={
              isStoreName && isAddress && isOwnerName && isOwnerPhoneNumber
                ? false
                : true
            }
          >
            수정
          </HalfButton>
        </SpaceBetweenContainer>
      </div>
    </>
  );
};

export default StoreInfoEdit;
