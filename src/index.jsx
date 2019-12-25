import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtToast } from "taro-ui";

import './index.scss';

//用微信小程序开发的Canvas绘制可配置的转盘抽奖: https://github.com/givebest/wechat-turntalbe-canvas/blob/master/pages/canvas/canvas.js

export default class Luckyturntable extends Component{
    constructor(props) {
      super(props);

      this.state = {
        /* screenWidth: 0,
        screenHeight: 0, */
        awardsList: [],
        animationData: {},
        disableLottery: false,

        awardMessage:'',
        showAwardMessage: false,
        messageIcon: 'sketch'
      }
    }

    async componentDidMount(){
      this.calculateAwardList();
    }

    calculateAwardList(){
      if(this.props.awards && this.props.awards.length > 0){
        let len = this.props.awards.length;
        let rotateDeg = 360 / len / 2 + 90;
        let result = [];
        let turnNum = 1 / len;  // 文字旋转 turn 值
        let circleCenterPoint = 420 / 2;

        let ctx = wx.createContext();
        for (var i = 0; i < len; i++) {
          // 保存当前状态
          ctx.save();
          // 开始一条新路径
          ctx.beginPath();
          // 位移到圆心，下面需要围绕圆心旋转
          ctx.translate(circleCenterPoint, circleCenterPoint);
          // 从(0, 0)坐标开始定义一条新的子路径
          ctx.moveTo(0, 0);
          // 旋转弧度,需将角度转换为弧度,使用 degrees * Math.PI/180 公式进行计算。
          ctx.rotate((360 / len * i - rotateDeg) * Math.PI/180);
          // 绘制圆弧
          ctx.arc(0, 0, circleCenterPoint, 0,  2 * Math.PI / len, false);

          // 颜色间隔
          if (i % 2 == 0) {
              ctx.setFillStyle('rgba(255,184,32,.1)');
          }else{
              ctx.setFillStyle('rgba(255,203,63,.1)');
          }

          // 填充扇形
          ctx.fill();
          // 绘制边框
          ctx.setLineWidth(0.5);
          ctx.setStrokeStyle('rgba(228,55,14,.1)');
          ctx.stroke();

          // 恢复前一个状态
          ctx.restore();

          // 奖项列表
          result.push({ turn: i * turnNum + 'turn', lineTurn: i * turnNum + turnNum / 2 + 'turn',
                        award: this.props.awards[i].award, id: this.props.awards[i].id});
        }
        this.setState({awardsList: result}, () => {
          //console.table(this.state.awardsList)
        });
      }
    }

    onGetLottery(e){
      if(this.state.disableLottery) return;

      let app = getApp();
      let awardIndex = Math.random() * this.props.awards.length >>> 0;
      let runNum = 8;

      // 旋转抽奖
      app.runDegs = app.runDegs || 0
      //console.log('deg', app.runDegs)
      app.runDegs = app.runDegs + (360 - app.runDegs % 360) + (360 * runNum - awardIndex * (360 / this.props.awards.length));
      //console.log('deg', app.runDegs);

      let animationRun = wx.createAnimation({
        duration: 4000,
        timingFunction: 'ease'
      });
      this.animationRun = animationRun;
      animationRun.rotate(app.runDegs).step();
      this.setState({
        showAwardMessage:false,
        disableLottery: true,
        animationData: animationRun.export()
      }, () => {});

      let that = this;
      setTimeout(function() {
        //console.log(`awardIndex: ${awardIndex}: ${that.props.awards[awardIndex].award}`);
        that.setState({
          awardMessage: that.props.awards[awardIndex].comment,
          messageIcon: that.props.awards[awardIndex].commentIcon || 'sketch',
          showAwardMessage:true,
          disableLottery:false
        })
      }, 4321);
    }

    render(){

      return(
        <View>

          <View className="canvas-container">

            <View animation={this.state.animationData} className="canvas-content" >

              <canvas className="canvas-element canvas-table-backgound" canvas-id="lotteryCanvas"></canvas>

              <View className="canvas-line">
                {
                  this.state.awardsList.map(item => {
                    let lineStyle = "-webkit-transform: rotate(" + item.lineTurn+");transform: rotate("+item.lineTurn+")"
                    return (
                      <View className="canvas-litem" key={item.id + '_line'} style={lineStyle}></View>
                    )
                  })
                }
              </View>

              <View className="canvas-list">
                {
                  this.state.awardsList.map(item => {
                    let awardStyle ="-webkit-transform: rotate(" + item.turn + ");transform: rotate(" + item.turn + ")"
                    return(
                      <View className="canvas-item"  key={item.id + '_award'}>
                          <View className="canvas-item-text" style={awardStyle}>{item.award}</View>
                      </View>
                    )
                  })
                }

              </View>

            </View>

              <View onClick={this.onGetLottery} className="canvas-btn ">{this.props.buttonTitle||'小激励'}</View>
          </View>

          <AtToast hasMask duration={5000} isOpened={this.state.showAwardMessage} text={this.state.awardMessage} icon={this.state.messageIcon}></AtToast>
        </View>
      );
    }
  }

