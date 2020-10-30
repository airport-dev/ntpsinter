//storeの呼び出し
import store from './store/index.js';
//変数宣言
var cropperimg;
var cropper;
var resultimg;
//Vueインスタンス
let app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
      //キャンバスのデータ 比率 4:3
      canvassize: { w:  480 ,  h: 360 },
      //残り時間
      timecnt : 60,
      timeprogress: 100,
      //グラフ用のデータ
      chartLists: [
        {name: "HAPPY", color: '#FB56AB', data: 0 ,label: "しあわせ"},
        {name: "DISGUSTED", color: '#B956FB', data: 0 ,label: "むかつく"},
        {name: "SURPRISED", color: '#FBA656', data: 0 ,label: "びっくり"},
        {name: "ANGRY", color: '#FB5661', data: 0 ,label: "おこった"},
        {name: "CONFUSED", color: '#FBF556', data: 0 ,label: "こんらん"},
        {name: "CALM", color: '#BEFB56', data: 0 ,label: "おちつき"},
        {name: "SAD", color: '#56C4FB', data: 0 ,label: "かなしい"},
      ],
      formData: {
        name: 'ナリタイツキ',
      },
      //結果を入れる
      result_facedetails: '', //表情のデータ
      results_arrayData: [], //
      result_smileData: [0], //笑顔の数値を入れるデータ
      video: {},
      canvas: {},
      canvasCtx: {},
      //表情解析に使う
      captures: [], //取得した画像のデータ
      isAnalyzeing: false,
      isrecognitionflg: true,
      isdoneflg: false,
      istrimming: false,
      previewflg: false,
      eventflag: false,
      timeoutId: '',
      response_photoData: [],
      emotions: {
        happyarray: [],
        disgustedarray: [],
        suprisedarray: [],
        angryarray: [],
        confusedarray: [],
        calmarray: [],
        sadarray: [],
      },
      //トリミング用
      quephotoData: ''
  },
  filters:{
      DataFormat: function(v){
          return v ==  null? 'なし': v;
      },
      GenderFormat: function(v){
          return v ==  "Female"? '女性': '男性';
      }
  },
  mounted () {
    //ビデオ＆キャンバスの作成
    this.createCanvas();
    //グラフを描画
    this.createChart();
  },
  computed: {
    getresimg() {
      //選択した画像を取得
      return store.getters.resimg;
    }
  },
  methods: {
    //ビデオの描画
    createCanvas: function(){
      let media;
      // video要素を紐づける
      this.video = this.$refs.video;
      // video要素にWebカメラの映像を表示させる
      media = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user'
        }
      }).then(function(stream) {
        video.srcObject = stream;
      });
      // canvas要素をつくる
      this.canvas = this.$refs.canvas;
      this.canvasCtx = canvas.getContext('2d');
      //キャンバスの更新
      this.canvasUpdate();
    },
    //キャンバスの更新処理
    canvasUpdate: function() {
      //キャンバスのアップデート
      this.canvasCtx.drawImage(this.video,0,0,this.canvassize.w,this.canvassize.h);
      requestAnimationFrame(this.canvasUpdate);
      //データが取得した時に実行
      if(this.isAnalyzeing && this.isrecognitionflg && this.result_facedetails != '' ){
        //顔のラインを取得&描画
        this.GetFacePositionData(this.result_facedetails);
      }
    },
    //タイマーの初期化処理
    ResetvariableData: function(){
      if(this.timecnt != 60){
        this.timecnt = 60;
        this.timeprogress = 100;
        //this.results_arrayData.splice(0);
      }
    },
    //トリミングを開始するメゾット
    conftrim(){
        var que;
        //選択された画像をキューに格納
        this.response_photoData.forEach(function(item) {
            if(item.isselect){
              //store.commit('insertImgResultData',item.img);
              que = item.img;
            }
        });
        //一時的なキューに保存
        this.quephotoData = que;
        var img = document.createElement('img');
        img.src= que;
        img.id = 'cropper-img';
        var queimg = document.getElementById('cropperbox').appendChild(img);
        cropperimg =document.getElementById("cropper-img");
        cropper = new Cropper(cropperimg,{
          aspectRatio: 3 / 3,
          zoomable: false,
          minCropBoxHeight: 300
        });
    },
    //画像の再選択を行うfunction
    canselepicture(){
      document.getElementById('cropperbox').innerHTML = '';
    },
    //トリミング処理実行メゾット
    cropImage(){
      var resultImgUrl = cropper.getCroppedCanvas().toDataURL();
      resultimg = document.getElementById('result-img');
      resultimg.src = resultImgUrl;
    },
    //画像をストアに保存する処理
    Getprofileimg(){
      store.commit('insertImgResultData',resultimg.src);
    },
    Getprofiledata(item){
      console.log('実行せれてない？',item.name);
      store.commit('insertnameResultData',item.name,{  root: true});
    },
    //ボタンを押したときの実行フラグなどの管理
    handlercaptureBtn: function(){
      //実行の状態を変える
      this.isAnalyzeing = !this.isAnalyzeing;
      //実行中の処理
      if(!this.isAnalyzeing){
        //スタートを押したときに配列の中身をけす
        //this.captures.splice(0);
        //初期化処理
        this.ResetvariableData();
      }
    },
    //ボタンを押したときの表情解析の時のメゾット
    togglecaptureBtn: function() {
      if(this.isAnalyzeing){
        //ビデオ読み取り
        console.log('実行中!!!' + this.isAnalyzeing);
        if(this.result_facedetails != ''){
          //一秒減らす
          this.timecnt--;
          this.timeprogress = this.timeprogress - 1.667;
        }
        this.capture();
        //制限時間が終了したときの処理
        if(this.timecnt <= 0){
          console.log('停止!' + this.isAnalyzeing);
          this.generateResultData();
          window.clearTimeout(this.timeoutId);
          this.isAnalyzeing = !this.isAnalyzeing;
          this.isdoneflg = true;
          this.ResetvariableData();
          return;
        }
        //1秒に一回読み込む
        this.timeoutId =window.setTimeout(this.togglecaptureBtn,1000);
      }else{
        console.log('停止!' + this.isAnalyzeing);
        window.clearTimeout(this.timeoutId);
        this.generateResultData();
        this.isdoneflg = true;
      }
    },
    //画像を読み取るメソッド
    async capture() {
        //キャンバスのアップデートを行う
        this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvassize.w, this.canvassize.h);
        this.captures.push(this.canvas.toDataURL('image/png'));
        //配列の末尾を入れる
        let image = this.captures.slice(-1)[0];
        //画像をアップロード
        let config = {
          headers: {
            'content-type': 'application/octet-stream',
          }
        };
        await axios
          .post(
            "https://jpa268wi65.execute-api.ap-northeast-1.amazonaws.com/api/rekognition",
            image,
            config
          )
          .then(response => {
              if(response.data.FaceDetails.length > 0){
                this.isrecognitionflg = true;
                let resultArr = response.data.FaceDetails.concat();
                resultArr.sort(
                  function(a,b){
                    return(a.Confidence < b.Confidence? 1: -1);
                  }
                );
                this.result_facedetails = resultArr[0];
                //データを入れる
                this.results_arrayData.push(this.result_facedetails);
                //笑ってたら入れる
                if(this.result_facedetails.Smile.Value){
                  this.result_smileData.push(this.result_facedetails.Smile.Confidence);
                }else{
                  this.result_smileData.push(0);
                }
                //感情のデータ取得
                this.GetEmotionData(this.result_facedetails);
                this.response_photoData.push({ img: response.config.data, isselect: false});
              }else{
                //顔が認識されていないときの処理
                this.isrecognitionflg = false;
              }
          })
          .catch(error => {
              console.log(error);
          });
    },
    //グラフを作成するのに必要な配列を作る処理
    listCategoryCreat: function(target){
      //グラフを描画するための連想配列を普通の配列に変換
      var targetList = this.chartLists.map(function (arr) {
          return [arr[target]]
      }).reduce(function (a, b) {
          return a.concat(b);
      });
      return targetList;
    },
    //グラフを描画する処理
    async createChart() {
      //配列の変換
      var labelList = this.listCategoryCreat('label');
      var colorList = this.listCategoryCreat('color');
      var dataList = this.listCategoryCreat('data');
      //グラフ描画の設定
      //horizontalBar
      var ctx = document.getElementById('chart').getContext('2d');
      await new Chart(ctx,{
        type: 'horizontalBar',
        data:{
          labels: labelList,
          datasets:[{
            backgroundColor: colorList,
            data: dataList,
            fill: false
          }]
        },
        options: {
           legend: {
              display: false
           },
           scales: {
              xAxes: [{
                  ticks: {
                    min:0,
                    max:100
                  }
              }]
           }
        }
      });
    },
    //画像をセレクトする処理
    selectPicture(num){
      //画像を一つだけしか選択させない処理
      this.response_photoData.forEach( function( item ) {
        //全部のセレクションをfalseにする
        item.isselect = false;
      });
      //選択した画像のセレクションをtrueにする
      this.response_photoData[num].isselect = true;
    },
    //結果をstoreのresultDataに格納する処理
    generateResultData: function(){
      //変数宣言
      let genderarray = [];
      let ageLowarray = [];
      let ageHigharray= [];
      //それぞれの配列に格納
      this.results_arrayData.forEach(function(item){
        genderarray.push(item.Gender);
        ageLowarray.push(item.AgeRange.Low);
        ageHigharray.push(item.AgeRange.High);
      });
      //それぞれの平均値を出す
      //性別
      var malelen = genderarray.filter(function(i){return i.Value === "Male"}).length;
      if(genderarray.length/2 > malelen){
        //女性の方が多い
        store.commit('insertGenderResultData',"女性");
      }else{
        //男性のほうが多い
        store.commit('insertGenderResultData',"男性");
      }
      //年齢の平均(Low)
      var agelowavg = this.average(ageLowarray);
      store.commit('insertAgeLowResultData',agelowavg);
      //年齢の平均(High)
      var agehighavg = this.average(ageHigharray);
      store.commit('insertAgeHighResultData',agehighavg);
      //スマイル値
      this.result_smileData.forEach(function(item){
        store.commit('insertSmileResultArrayData',item);
      });
      //感情のデータを格納
      this.emotions.happyarray.forEach(function(item){
        store.commit('insertHappyResultArrayData',item);
      });
      this.emotions.disgustedarray.forEach(function(item){
        store.commit('insertDisgustedResultArrayData',item);
      });
      this.emotions.suprisedarray.forEach(function(item){
        store.commit('insertSuprisedResultArrayData',item);
      });
      this.emotions.angryarray.forEach(function(item){
        store.commit('insertAngryResultArrayData',item);
      });
      this.emotions.confusedarray.forEach(function(item){
        store.commit('insertConfusedResultArrayData',item);
      });
      this.emotions.calmarray.forEach(function(item){
        store.commit('insertCalmResultArrayData',item);
      });
      this.emotions.sadarray.forEach(function(item){
        store.commit('insertSadResultArrayData',item);
      });
    },
    //合計値を求める関数
    sum : function(arr){
        //合計を求める
        var sum = 0;
        arr.forEach(function(elm){
          sum += elm;
        });
        return sum;
    },
    //平均値を求める関数
    average: function(arr){
      return this.sum(arr)/arr.length;
    },
    //顔の枠線を表示する処理
    GetFacePositionData(res){
      //顔の枠を表示する処理
      const flp = res.BoundingBox.Left*this.canvassize.w;
      const ftp = res.BoundingBox.Top*this.canvassize.h;
      const fwp = res.BoundingBox.Width*this.canvassize.w;
      const fhp = res.BoundingBox.Height*this.canvassize.h;
      const ctx = document.getElementById('canvas').getContext('2d');
      if(res.Smile.Value){
        ctx.strokeStyle = "#ff0000";
      }else{
        ctx.strokeStyle = "#ffffff";
      }
      ctx.lineWidth = 3;
      ctx.strokeRect(flp,ftp,fwp,fhp);
    },
    //感情のデータを取得する処理
    async GetEmotionData(res){
      //感情のデータを手に入れる関数
      var happyData = res.Emotions.find((v)=>v.Type === "HAPPY");
      var disgutedData = res.Emotions.find((v)=>v.Type === "DISGUSTED");
      var suprisedData = res.Emotions.find((v)=>v.Type === "SURPRISED");
      var angryData = res.Emotions.find((v)=>v.Type === "ANGRY");
      var confusedData = res.Emotions.find((v)=>v.Type === "CONFUSED");
      var calmData = res.Emotions.find((v)=>v.Type === "CALM");
      var sadData = res.Emotions.find((v)=>v.Type === "SAD");
      //配列に入れる
      this.emotions.happyarray.push(happyData.Confidence);
      this.emotions.disgustedarray.push(disgutedData.Confidence);
      this.emotions.suprisedarray.push(suprisedData.Confidence);
      this.emotions.angryarray.push(angryData.Confidence);
      this.emotions.confusedarray.push(confusedData.Confidence);
      this.emotions.calmarray.push(calmData.Confidence);
      this.emotions.sadarray.push(sadData.Confidence);
      //該当の感情データを書き換え
      const emohapppy = this.chartLists.find(emohapppy => emohapppy.name == happyData.Type );
      emohapppy.data = happyData.Confidence;
      const emodiguted = this.chartLists.find(emodiguted => emodiguted.name == disgutedData.Type );
      emodiguted.data = disgutedData.Confidence;
      const emosuprised = this.chartLists.find(emosuprised => emosuprised.name == suprisedData.Type );
      emosuprised.data = suprisedData.Confidence;
      const emoangry = this.chartLists.find(emoangry => emoangry.name == angryData.Type );
      emoangry.data = angryData.Confidence;
      const emoconfused = this.chartLists.find(emoconfused => emoconfused.name == confusedData.Type );
      emoconfused.data = confusedData.Confidence;
      const emocalm = this.chartLists.find(emocalm => emocalm.name == calmData.Type );
      emocalm.data = calmData.Confidence;
      const emosad = this.chartLists.find(emosad => emosad.name == sadData.Type );
      emosad.data = sadData.Confidence;
      //グラフで描画
      if(this.isAnalyzeing){
        await this.createChart();
      }
    }
  }
})