// 0. Install fingerpose npm install fingerpose
// 1. Add Use State
// 2. Import emojis and finger pose import * as fp from "fingerpose";
// 3. Setup hook and emoji object
// 4. Update detect function for gesture handling
// 5. Add emoji display to the screen

///////// NEW STUFF ADDED USE STATE
import React, { useRef, useState, useEffect } from "react";
///////// NEW STUFF ADDED USE STATE

// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

///////// NEW STUFF IMPORTS
import * as fp from "fingerpose";
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";

import thumbs_left from "./thumbs_right.png"; // 캠 좌,우 반전이므로 이미지도 좌,우 바꾸기
import thumbs_right from "./thumbs_left.png";
import FingerOne from "./FingerOne.png";
import FingerThree from "./FingerThree.png";
import FingerFour from "./FingerFour.png";
import FingerFive from "./FingerFive.png";
import Fist from "./Fist.png";
import ok from "./FingerOk.png";

import thumbs_down from "./thumbs_down.png";
import set1 from "./set1.png";
import side1 from "./side1.png";
import burger1 from "./burger1.png";
import main from "./Bener.png";
// import sidemenu from "./sidemenu.png";
import submain from "./submain.png";
import drink from "./drink.png";
import confirm from "./confirm.png";

///////// NEW STUFF IMPORTS

// 0: 세트 / 1: 버거 / 2: 사이드 / 3: 음료
var MenuInfo = {
  information:[
    {
      id:0,
      name: '리치 포테이토 버거 세트',
      price: 50
    },
    {
      id:0,
      name: '리치 포테이토 머쉬룸 버거 세트',
      price: 0
    },
    {
      id:0,
      name: '빅맥 세트',
      price: 2
    },
    {
      id:0,
      name: '맥스파이시 상하이 버거 세트',
      price: 3
    },
    {
      id:0,
      name: '맥치킨 세트',
      price: 4
    },
    {
      id:0,
      name: '더블 1955 버거 세트 ',
      price: 5
    },
    {
      id:0,
      name: '에그 불고기 버거 세트',
      price: 56
    },
    {
      id:0,
      name: '불고기 버거 세트',
      price: 55
    },

    {
      id:1,
      name: '리치 포테이토 버거',
      price: 50
    },
    {
      id:1,
      name: '리치 포테이토 머쉬룸 버거',
      price: 0
    },
    {
      id:1,
      name: '빅맥',
      price: 2
    },
    {
      id:1,
      name: '맥스파이시 상하이 버거',
      price: 3
    },
    {
      id:1,
      name: '맥치킨 모짜렐라',
      price: 4
    },
    {
      id:1,
      name: '더블 1955 버거 ',
      price: 5
    },
    {
      id:1,
      name: '에그 불고기 버거',
      price: 56
    },
    {
      id:1,
      name: '불고기 버거',
      price: 55
    },
    
    {
      id:2,
      name: '타로 파이',
      price: 0
    },
    {
      id:2,
      name: '맥스파이시 상하이 치킨 스낵랩',
      price: 2
    },
    {
      id:2,
      name: '골든 모짜렐라 치즈스틱',
      price: 3
    },
    {
      id:2,
      name: '후렌치 후라이',
      price: 4
    },
    {
      id:3,
      name: '딸기 쉐이크',
      price: 0
    },
    {
      id:3,
      name: '초코 쉐이크',
      price: 2
    },
    {
      id:3,
      name: '코카-콜라',
      price: 3
    },
    {
      id:3,
      name: '코카-콜라 제로',
      price: 4
    },
   
  ]
}

var MenuInfomation = [['맥스파이시 상하이 버거 세트', '더블 1955버거 세트','에그 불고기 버거 세트','불고기 버거 세트'], ['리치 포테이토 머쉬룸 버거', '빅맥','베이컨 토마토 디럭스','1955버거'],
['타로파이', '맥스파이시 상하이 치킨 스낵랩','골든 모짜렐라 치즈스틱','후렌치 후라이'],['딸기 쉐이크','초코 쉐이크','코라-콜라','코카-콜라 제로']
]

// 현재 선택 메뉴
var SelectState = 0;

// 핸드포즈가 몇 프레임 동안 동일하게 나와야  
var Handpose_count = 0;

// 장바구니 가격
var Price = 0;


var Menu1flag = 0;
var Menu2flag = 0;

// 베너가 시작 됬는지 끝났는지
var Benercount = 0;
var state = null;

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  ///////// NEW STUFF ADDED STATE HOOK
  const [emoji, setEmoji] = useState(null);
  const [Menu, setMenu] = useState(null);
  // const [SideMenu,setSideMenu] = useState(null);
  const [Submain,setSubmain] = useState(null);


  const images = { thumbs_up: thumbs_up, 
    victory: victory, 
    thumbs_down:thumbs_down, 
    thumbs_left:thumbs_left,
    thumbs_right:thumbs_right,
    FingerOne:FingerOne,
    FingerThree:FingerThree,
    FingerFour:FingerFour,
    FingerFive:FingerFive,
    Fist:Fist,
    ok:ok, };

  const images_t = { FingerOne: set1,victory: burger1, FingerThree:side1, FingerFour:drink};  ////////

  ///////// NEW STUFF ADDED STATE HOOK

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);   
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);

      ///////// NEW STUFF ADDED GESTURE HANDLING

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          //fp.Gestures.ThumbsUpGesture,

          //여기
          //fp.Gestures.ThumbsDownGesture,
          fp.Gestures.ThumbsLeftGesture,
          fp.Gestures.ThumbsRightGesture,
          fp.Gestures.FingerOneGesture,
          fp.Gestures.FingerThreeGesture,
          fp.Gestures.FingerFourGesture,
          fp.Gestures.FingerFiveGesture,
          fp.Gestures.FistGesture,
          fp.Gestures.OkGesture,
        ]);

        // 신뢰도 제어
        const gesture = await GE.estimate(hand[0].landmarks, 6); 

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name);
          
          
          // 수정함
          state = gesture.gestures[maxConfidence].name;
          Handpose_count++;
          

          // 손바닥일 경우 submain 출력
          if(state == "FingerFive" && Benercount==0 && Handpose_count > 15){
            // submain 출력
            setSubmain(state);
            console.log("Benercount : ", Benercount)
            Benercount = 1;
            Handpose_count = 0;
            document.getElementById("mainmenu").style.display = "none";
          }

          
        
          // setMenu(gesture.gestures[maxConfidence].name);
          // setSideMenu(gesture.gestures[maxConfidence].name);
          // SubMenu에서 1. 세트 / 2. 버거 / 3. 사이드 / 4. 음료 결정
          if(Benercount == 1 && Handpose_count > 15){
            console.log("현재 상태 : ", state)
            
            if(state == "FingerOne" ){
              console.log("확인 테스트1 : ", state)
              document.getElementById("submenu").style.display = "none";
              setMenu(gesture.gestures[maxConfidence].name);
              // setSideMenu(gesture.gestures[maxConfidence].name);
              Benercount++;
              Menu1flag = 1;
              Handpose_count = 0;
            }
            else if(state == "victory"){
              console.log("확인 테스트1 : ", state)
              setMenu(gesture.gestures[maxConfidence].name);
              document.getElementById("submenu").style.display = "none";
              // setSideMenu(gesture.gestures[maxConfidence].name);
              Benercount++;
              Menu1flag = 2;
              Handpose_count = 0;
            }
            else if(state == "FingerThree")
            {
              console.log("확인 테스트1 : ", state)
              setMenu(gesture.gestures[maxConfidence].name);
              document.getElementById("submenu").style.display = "none";
              Benercount++;
              // setSideMenu(gesture.gestures[maxConfidence].name);
              Menu1flag = 3;
              Handpose_count = 0;
            } 
            else if(state == "FingerFour")
            {
              console.log("확인 테스트1 : ", state)
              setMenu(gesture.gestures[maxConfidence].name);
              document.getElementById("submenu").style.display = "none";
              Benercount++;
              // setSideMenu(gesture.gestures[maxConfidence].name);
              Menu1flag = 4;
              Handpose_count = 0;
            } 
          }

          // 세부메뉴 선택
          console.log("세부메뉴 진입 전 테스트 : ", Menu1flag,state, Benercount,Handpose_count )
          if(Benercount ==2  && Handpose_count>15){
            console.log("세부메뉴 진입 후 테스트 : ", Menu1flag,state, Benercount,Handpose_count )
            Handpose_count = 0;
            var temp;
            if(Menu1flag == 1){
              if(state == "FingerOne" ){
                document.getElementById("demo").innerHTML = "리치 포테이토 버거 세트";
                document.getElementById("demo2").innerHTML = "Price : 6500";
                Price = 6500;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "victory"){
                document.getElementById("demo").innerHTML = "리치 포테이토 머쉬룸 버거 세트";
                document.getElementById("demo2").innerHTML = "Price : 7200";
                Price = 7200;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerThree"){
                document.getElementById("demo").innerHTML = "빅맥 세트";
                document.getElementById("demo2").innerHTML = "Price : 5900";
                Price = 5900;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerFour"){
                document.getElementById("demo").innerHTML = "맥스파이시 상하이 버거 세트";
                document.getElementById("demo2").innerHTML = "Price : 6200";
                Price = 6200;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              Handpose_count = 0;
            }
            else if(Menu1flag == 2){
              if(state == "FingerOne" ){
                document.getElementById("demo").innerHTML = "리치 포테이토 버거";
                document.getElementById("demo2").innerHTML = "Price : 5500";
                Price = 5500;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "victory"){
                document.getElementById("demo").innerHTML = "1955 버거";
                document.getElementById("demo2").innerHTML = "Price : 6200";
                Price = 6200;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerThree"){
                document.getElementById("demo").innerHTML = "맥치킨 모짜렐라";
                document.getElementById("demo2").innerHTML = "Price : 4900";
                Price = 4900;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerFour"){
                document.getElementById("demo").innerHTML = "베이컨 토마토 디럭스 버거";
                document.getElementById("demo2").innerHTML = "Price : 5200";
                Price = 5200;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              Handpose_count = 0;
            }
            else if(Menu1flag == 3)
            {
              if(state == "FingerOne" ){
                document.getElementById("demo").innerHTML = "타로 파이";
                document.getElementById("demo2").innerHTML = "Price : 2000";
                Price = 2000;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "victory"){
                document.getElementById("demo").innerHTML = "맥스파이시 상하이 치킨 스낵랩";
                document.getElementById("demo2").innerHTML = "Price : 1500";
                Price = 1500;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerThree"){
                document.getElementById("demo").innerHTML = "골든 모짜렐라 치즈스틱";
                document.getElementById("demo2").innerHTML = "Price : 2500";
                Price = 2500;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerFour"){
                document.getElementById("demo").innerHTML = "후렌치 후라이";
                document.getElementById("demo2").innerHTML = "Price : 1300";
                Price = 1300;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              Handpose_count = 0;
            } 
            else if(Menu1flag == 4)
            {
              if(state == "FingerOne" ){
                document.getElementById("demo").innerHTML = "바닐라 쉐이크";
                document.getElementById("demo2").innerHTML = "Price : 2000";
                Price = 2000;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "victory"){
                document.getElementById("demo").innerHTML = "딸기 쉐이크";
                document.getElementById("demo2").innerHTML = "Price : 2000";
                Price = 2000;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerThree"){
                document.getElementById("demo").innerHTML = "초코 쉐이크";
                document.getElementById("demo2").innerHTML = "Price : 2000";
                Price = 2000;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              else if(state == "FingerFour"){
                document.getElementById("demo").innerHTML = "코카-콜라";
                document.getElementById("demo2").innerHTML = "Price : 2000";
                Price = 2000;
                document.getElementById("confirm").style.display = "inline";
                Benercount++;

              }
              Handpose_count = 0;
            } 

          }

          // if(state == "victory" ){
          //   console.log("state victory체크", state)
          //   document.getElementById("demo").innerHTML = "gd";
          // }
          // else if(state == "FingerOne"){
          //   document.getElementById("demo").innerHTML = "good";
          // }
          // else if(state == "FingerThree")
          // {
          //   document.getElementById("demo").innerHTML = "my good";
          // }
        
          


          // // 옆에 사이드
          // setSideMenu(1);
  
        }
        
      }

      ///////// NEW STUFF ADDED GESTURE HANDLING

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  useEffect(()=>{runHandpose()},[]);

  return (
    <div className="App">
      <header className="App-header">

        <Webcam
          ref={webcamRef}
          style={{
            position: "fixed",
            marginLeft: "auto",
            marginRight: "auto",
            left: 100,
            top: "68%",
            right: 0,
            textAlign: "center",
            zindex: 9,
            height: "32%",
          }}
        />
        <div style={{
              backgroundColor: "#D4B362",
              borderRadius: "10",
              borderColor: "black",
              borderStyle: "solid",
              color: "white",
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "center",
              top: "68%",
              width:"11%"
            }}>
          장바구니
        </div>
        <div id ="demo" style={{
              color: "black",
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "left",
              top: "73%",
              width:"25%"
            }}>
          ------------------
        </div>
        <div id ="demo2" style={{
              color: "black",
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              // textAlign: "center",
              top: "76%",
              width:"10%"
            }}>
          
        </div>
        {/* 메뉴 선택 알림창 */}
        {/* TTS 활용하기 */}
        {/* <div id="confirm"  style={{
              display: "none",
              color: "black",
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "center",
              backgroundColor: "white",
              top: "50%",
              left: "35%",
              width:"28%",
              height:"18%",
              zIndex: "100",
            }}>
              
          선택하신 메뉴를 결제 하시겠습니까?
            <div><img src={ok} style={{width: "5%"}}></img>Yes &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src={victory} style={{width: "5%"}}></img>No</div>
        </div>  */}

        <img id="confirm"
            src={confirm}
            style={{
              display: "none",
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "center",
              height: "68%",
              width:"100%",
              zIndex: "100",
            }}
          />
          {/* 초기화면 */}
          <img id="mainmenu"
            src= {main}
            style={{
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              right: 0,
              textAlign: "center",
              height: "68%",
              width:"100%",
              zIndex: "2",
            }}
          />


          {Submain !== null ? (
          <img  id="submenu"
            src={submain}
            style={{
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              right: 0,
              textAlign: "center",
              height: "68%",
              width:"100%",
              zIndex: "10",
            }}
          />
        ) : (
          ""
        )}
        
        {/* {SideMenu !== null ? (
          <img
            src={sidemenu}
            style={{
              position: "fixed",
              float: "left",
              marginLeft: "auto",
              marginRight: "auto",
              
              textAlign: "center",
              height: "68%",
              width:"20%",
              zIndex: "20",
            }}
          />
        ) : (
          ""
        )} */}

        {Menu !== null ? (
          <img
            src={images_t[Menu]}
            style={{
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              right: 0,
              textAlign: "center",
              height: "68%",
              width:"100%",
              zIndex: "20",
            }}
          />
        ) : (
          ""
        )}

        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            marginLeft: "auto",
            marginRight: "auto",
            top: "68%",
            left: 100,
            right: 0,
            textAlign: "center",
            zindex: 9,
            height: "32%",
          }}
        />
        {/* NEW STUFF */}
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "fixed",
              marginLeft: "auto",
              marginRight: "auto",
              left: 350,
              top: "68%",
              bottom: 200,
              right: 0,
              textAlign: "center",
              height: "5%",
            }}
          />
        ) : (
          ""
        )}

        {/* NEW STUFF */}
      </header>
    </div>
   
    
  );
}
export default App;