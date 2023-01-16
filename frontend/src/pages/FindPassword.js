import React, { useState } from "react";
import { customAxios } from "./customAxios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Logo } from "../components/common/Logo";
import { Container } from "../components/common/Container";
import Formbox from "../components/common/FormBox";
import { Intro } from "../components/common/Intro";
import { Input, ShortInput } from "../components/common/Input";
import { MainButton, SendButton } from "../components/common/Button";

const FindPassword = () => {
  // 이메일, 인증번호, 새로운 비밀번호
  const [email, setEmail] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [sendText, setSendText] = useState("전송");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");

  // 유효성 검사
  const [isEmail, setIsEmail] = useState(false); // 이메일 형식에 맞는지
  const [isJoinedEmail, setIsJoinedEmail] = useState(false); // 가입된 이메일인지
  const [isEmailCheck, setIsEmailCheck] = useState(false); // 인증번호 인증되었는지
  const [isNewPassword, setIsNewPassword] = useState(false); // 비밀번호 형식에 맞는지
  const [isNewPasswordCheck, setIsNewPasswordCheck] = useState(false); // 비밀번호 중복 확인

  // 오류 메세지 상태 저장
  const [emailMessage, setEmailMessage] = useState("");
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [newPasswordMessage, setNewPasswordMessage] = useState("");
  const [newPasswordCheckMessage, setNewPasswordCheckMessage] = useState("");

  const navigate = useNavigate();

  // 이메일
  const onChangeEmail = (e) => {
    const emailRegex =
      /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    setEmail(e.target.value);

    if (!emailRegex.test(e.target.value)) {
      setEmailMessage("이메일 형식을 다시 확인해주세요.");
      setIsEmail(false);
    } else {
      setEmailMessage("올바른 이메일 형식입니다.");
      setIsEmail(true);
    }
  };

  // 이메일 중복 확인 (이메일 가입 여부 확인)
  const checkEmail = async () => {
    try {
      const { data } = await customAxios.post("/auth/check-email", {
        email,
      });

      if (data.result === "success") {
        // 가입된 이메일이 아닌 경우
        setEmailMessage("가입된 이메일이 아닙니다.");
        setIsJoinedEmail(false);
      } else {
        // 가입된 이메일인 경우
        setEmailMessage("가입된 이메일입니다.");
        setIsJoinedEmail(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // 비밀번호
  const onChangeNewPassword = (e) => {
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
    setNewPassword(e.target.value);

    if (!passwordRegex.test(e.target.value)) {
      setNewPasswordMessage(
        "숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요."
      );
      setIsNewPassword(false);
    } else {
      setNewPasswordMessage("안전한 비밀번호입니다.");
      setIsNewPassword(true);
    }

    // password가 바뀔 때에도 passwordCheck와 일치한지 확인
    if (newPasswordCheck !== e.target.value) {
      setNewPasswordCheckMessage("일치하지 않는 비밀번호입니다.");
      setIsNewPasswordCheck(false);
    } else {
      setNewPasswordCheckMessage("비밀번호가 일치합니다.");
      setIsNewPasswordCheck(true);
    }
  };

  // 비밀번호 확인
  const onChangeNewPasswordCheck = (e) => {
    setNewPasswordCheck(e.target.value);

    if (newPassword !== e.target.value) {
      setNewPasswordCheckMessage("일치하지 않는 비밀번호입니다.");
      setIsNewPasswordCheck(false);
    } else {
      setNewPasswordCheckMessage("비밀번호가 일치합니다.");
      setIsNewPasswordCheck(true);
    }
  };

  // 이메일로 인증번호 보내기
  const sendEmailCode = async () => {
    alert("전송되었습니다."); // 전송까지 시간이 좀 걸리지만 일단 전송 확인 메세지부터 띄움
    setSendText("재전송");

    try {
      await customAxios.post("/auth/email", {
        email,
      });
    } catch (e) {
      console.log(e);
    }
  };

  // 인증 확인 눌러서 post 요청 보내면 일치할 경우 200, 이외의 경우에는 400을 응답
  const onEmailCheck = async () => {
    try {
      const { data } = await customAxios.post("/auth/email-auth", {
        code: certificationNumber.toUpperCase(),
      });

      if (data.state === 200) {
        setEmailCheckMessage("인증에 성공했습니다.");
        setIsEmailCheck(true);
      } else {
        setEmailCheckMessage(data.massage);
        setIsEmailCheck(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmit = async () => {
    try {
      const { data } = await customAxios.post("/auth/change-password", {
        email,
        newPassword,
      });

      alert(data.massage);
      navigate("/login");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Header text="비밀번호 찾기" back={true}></Header>
      <Logo />
      <Container>
        {isEmailCheck ? null : (
          <>
            <Formbox>
              <p>Step 1. 이메일 인증하기</p>
              <Intro>이메일 주소</Intro>
              <div>
                <ShortInput
                  name="email"
                  value={email}
                  type="email"
                  onChange={onChangeEmail}
                  placeholder="이메일 주소 입력"
                  required={true}
                />
                <SendButton
                  type="button"
                  onClick={checkEmail}
                  disabled={isEmail ? false : true}
                >
                  확인
                </SendButton>
              </div>
              {email.length > 0 && (
                <p className={`message ${isEmail ? "success" : "error"}`}>
                  {emailMessage}
                </p>
              )}
            </Formbox>
            <Formbox>
              <Intro>메일 인증</Intro>
              <div>
                <ShortInput
                  name="certificationNumber"
                  value={certificationNumber}
                  type="text"
                  onChange={(e) => setCertificationNumber(e.target.value)}
                  placeholder="인증번호 입력"
                  required={true}
                  marginBottom="21px"
                  textTransform="uppercase"
                />
                <SendButton
                  type="button"
                  onClick={sendEmailCode}
                  disabled={isEmail && isJoinedEmail ? false : true}
                >
                  {sendText}
                </SendButton>
              </div>
              <MainButton
                borderRadius="5px"
                onClick={onEmailCheck}
                disabled={
                  certificationNumber.length > 0 && !isEmailCheck ? false : true
                }
              >
                인증 확인
              </MainButton>
              {certificationNumber.length > 0 && (
                <p className={`message ${isEmailCheck ? "success" : "error"}`}>
                  {emailCheckMessage}
                </p>
              )}
            </Formbox>
          </>
        )}
        {!isEmailCheck ? null : (
          <>
            <Formbox>
              <p>Step 2. 비밀번호 변경하기</p>
              <Intro>새로운 비밀번호</Intro>
              <Input
                name="newPassword"
                value={newPassword}
                type="password"
                onChange={onChangeNewPassword}
                placeholder="비밀번호 입력"
                required={true}
              />
              {newPassword.length > 0 && (
                <p className={`message ${isNewPassword ? "success" : "error"}`}>
                  {newPasswordMessage}
                </p>
              )}
            </Formbox>
            <Formbox>
              <Intro>비밀번호 확인</Intro>
              <Input
                name="newPasswordCheck"
                value={newPasswordCheck}
                type="password"
                onChange={onChangeNewPasswordCheck}
                placeholder="비밀번호 재입력"
                required={true}
              />
              {newPasswordCheck.length > 0 && (
                <p
                  className={`message ${
                    isNewPasswordCheck ? "success" : "error"
                  }`}
                >
                  {newPasswordCheckMessage}
                </p>
              )}
            </Formbox>
            <MainButton
              borderRadius="5px"
              onClick={onSubmit}
              disabled={
                isEmailCheck && isNewPassword && isNewPasswordCheck
                  ? false
                  : true
              }
            >
              비밀번호 변경
            </MainButton>
          </>
        )}
      </Container>
    </>
  );
};

export default FindPassword;
