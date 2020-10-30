//storeの呼び出し
import store from './store/index.js'
let app = new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        result:{
            name: '',
            gender: '',
            agelow: 0,
            agehigh: 0,
            smilearray: [],
            img: '',
            emotions: {
              happyarray: [],
              disgustedarray: [],
              suprisedarray: [],
              angryarray: [],
              confusedarray: [],
              calmarray: [],
              sadarray: [],
            }
        },
        emoavg: {
              happy: 0,
              disgusted: 0,
              suprised: 0,
              angry: 0,
              confused: 0,
              calm: 0,
              sad: 0,
        },
        tab: null,
        emotype: '',
        isPush: false
    },
    computed: {
      ageavg(){
          let i = this.result.agehigh + this.result.agelow;
          return  i/2;
      }  
    },
    mounted(){
        this.getResultDatas();
    },
    methods:{
        getResultDatas: function(){
            console.log('storeの情報見ます！ result.js 18',store.state.resultData);
            this.result.name = store.state.resultData.name;
            this.result.gender = store.state.resultData.gender;
            this.result.agelow = store.state.resultData.agelow;
            this.result.agehigh = store.state.resultData.agehigh;
            this.result.smilearray = store.state.resultData.smilearray;
            this.result.img =store.state.resultData.img;
            this.result.emotions.happyarray = store.state.resultData.emotions.happyarray;
            this.result.emotions.disgustedarray = store.state.resultData.emotions.disgustedarray;
            this.result.emotions.suprisedarray = store.state.resultData.emotions.suprisedarray;
            this.result.emotions.angryarray = store.state.resultData.emotions.angryarray;
            this.result.emotions.confusedarray = store.state.resultData.emotions.confusedarray;
            this.result.emotions.calmarray = store.state.resultData.emotions.calmarray;
            this.result.emotions.sadarray = store.state.resultData.emotions.sadarray;
            console.log('データの取得の実行！ result.js 18',this.result);
            //グラフの平均値を求める
            this.getAverageEmotionsData();
            //データ取得後にグラフを描画する
            //this.CreateCharts();
        },
        async generateCanvasimage(){
          await this.resetimg();
          //画像を生成
          var img = document.createElement('img');
          var client_w = document.getElementById('capture').clientWidth;
          var client_h = document.getElementById('capture').clientHeight;
          img.id = 'canvas-image';
          img.width = client_w;
          img.height = client_h;
        　//img.style.borderRadius = 10;
        　document.getElementById('canvasimagebox').appendChild(img);
          html2canvas(document.querySelector("#capture")).then(canvas => {
            // canvasをimgtタグに挿入できる形に変更
            canvas.getContext('2d').drawImage(img,0,0,img.width,img.height,0,0,client_w,client_h);
            //canvas.getContext('2d').drawImage(img,0,0,client_w,client_h,0,0,client_w,client_h);
        　  //canvas.style.borderRadius = 10;
            var imageData = canvas.toDataURL('image/png');
            // imgタグに画像として、canvasの内容を挿入
            document.getElementById('canvas-image').setAttribute("src",canvas.toDataURL('image/png'));
            this.saveCanvas(imageData);
            this.isPush = false;
          });
        },
        resetimg(){
          //初期化処理
          this.isPush = true;
          document.getElementById('canvasimagebox').innerHTML='';
        },
        saveCanvas: function(urlimg){
        	var canvas = document.getElementById('canvas-image');
        	var uri = urlimg;
        	if (canvas.msToBlob) { //IE対応
        		var blob = this.toBlob(uri);
        		window.navigator.msSaveBlob(blob, 'download.png');
        	} else {
        		//アンカータグを作成
        		var a = document.createElement('a');
        		a.href = uri;
        		a.download = 'download.png';
        		//クリックイベントを発生させる
        		a.click();
        	}
        },
        //Base64データをBlobデータに変換
        toBlob: function(base64) {
        	var bin =  atob(base64.replace(/^.*,/, ''));
        	var buffer = new Uint8Array(bin.length);
        	for (var i = 0; i < bin.length; i++) {
        		buffer[i] = bin.charCodeAt(i);
        	}
        	var blob = new Blob([buffer.buffer], {type: 'image/png'});
        	return blob;
        },
        reset(){
            //初期化
            store.commit('initialStateResultData');
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
        getAverageEmotionsData(){
            var emo = this.emoavg;
            var resctx = this.result.emotions;
            //平均を求める
            emo.happy = this.average(resctx.happyarray);
            emo.disgusted = this.average(resctx.disgustedarray);
            emo.suprised = this.average(resctx.suprisedarray);
            emo.angry = this.average(resctx.angryarray);
            emo.confused = this.average(resctx.confusedarray);
            emo.calm = this.average(resctx.calmarray);
            emo.sad = this.average(resctx.sadarray);
            //感情の一番大きい値を感情タイプにする
            var emomax = Math.max(emo.happy,emo.disgusted,emo.suprised,emo.angry,emo.confused,emo.calm,emo.sad);
            if(emomax === emo.happy){
                this.emotype = "幸せ";
            }else if(emomax === emo.disgusted){
                this.emotype = "嫌悪感";
            }else if(emomax === emo.suprised){
                this.emotype = "驚き";
            }else if(emomax === emo.angry){
                this.emotype = "怒り";
            }else if(emomax === emo.confused){
                this.emotype = "困惑";
            }else if(emomax === emo.calm){
                this.emotype = "冷静";
            }else{
                this.emotype = "悲しい";
            }
            
            // console.log('感情の平均値',emo);
            // var ctx = document.getElementById('myRaderChart').getContext('2d');
            // var myRaderChart = new Chart(ctx,{
            //     typle: 'radar',
            //     labels:["しあわせ","むかつく","びっくり","おこった","こんらん","おちつき","かなしい"],
            //     data:[emo.happy,emo.disgusted,emo.suprised,emo.angry,emo.confused,emo.calm,emo.sad],
            //     backgroundColor: 'RGBA(225,95,150, 0.5)',
            //     borderColor: 'RGBA(225,95,150, 1)',
            //     borderWidth: 1,
            //     pointBackgroundColor: 'RGB(46,106,177)'
            // });
        },
    }
})