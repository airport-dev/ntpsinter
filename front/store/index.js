// ストアオブジェクトの作成
const initialState = {
  resultData: {
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
  }
}

const getters = {
  resimg: state => state.resultData.img,
  rehappy: state =>  state.resultData.emotions.happyarray,
  redisgusted: state => state.resultData.emotions.disgustedarray,
  resuprised: state => state.resultData.emotions.suprisedarray,
  reangry: state => state.resultData.emotions.angryarray,
  reconfused: state => state.resultData.emotions.confusedarray,
  recalm: state => state.resultData.emotions.calmarray,
  resadarry: state => state.resultData.emotions.sadarray,
}

const mutations = {
  //性別のデータを取得
  insertGenderResultData(state,item){
      state.resultData.gender = item 
  },
  //年齢のデータを取得
  insertAgeLowResultData(state,item){
    state.resultData.agelow = item
  },
  insertAgeHighResultData(state,item){
    state.resultData.agehigh = item
  },
  //笑顔のデータを取得
  insertSmileResultArrayData(state,item){
    state.resultData.smilearray.push(item)
  },
  //感情のデータを取得(happy)
  insertHappyResultArrayData(state,item){
    state.resultData.emotions.happyarray.push(item)
  },
  //感情のデータを取得(disgusted)
  insertDisgustedResultArrayData(state,item){
    state.resultData.emotions.disgustedarray.push(item)
  },
  //感情のデータを取得(suprised)
  insertSuprisedResultArrayData(state,item){
    state.resultData.emotions.suprisedarray.push(item)
  },
  //感情のデータを取得(angry)
  insertAngryResultArrayData(state,item){
    state.resultData.emotions.angryarray.push(item)
  },
  //感情のデータを取得(confused)
  insertConfusedResultArrayData(state,item){
    state.resultData.emotions.confusedarray.push(item)
  },
  //感情のデータを取得(calm)
  insertCalmResultArrayData(state,item){
    state.resultData.emotions.calmarray.push(item)
  },
  //感情のデータを取得(sad)
  insertSadResultArrayData(state,item){
    state.resultData.emotions.sadarray.push(item)
  },
  //映像のデータを取得
  insertImgResultData(state,item){
    state.resultData.img = item
  },
  //名前のデータを取得
  insertnameResultData(state,item){
    state.resultData.name =  item
  },
  //初期化処理
  initialStateResultData(state){
   state.resultData.name = ''
   state.resultData.gender = ''
   state.resultData.agelow = 0
   state.resultData.agehigh = 0
   state.resultData.smilearray.splice(0)
   state.resultData.img = ''
   state.resultData.emotions.happyarray.splice(0)
   state.resultData.emotions.disgustedarray.splice(0)
   state.resultData.emotions.suprisedarray.splice(0)
   state.resultData.emotions.angryarray.splice(0)
   state.resultData.emotions.confusedarray.splice(0)
   state.resultData.emotions.calmarray.splice(0)
   state.resultData.emotions.sadarray.splice(0)
  }
}

export default new Vuex.Store({
  state: initialState,
  mutations: mutations,
  getters: getters,
  plugins: [window.createPersistedState({storage: window.sessionStorage,key:'makelicensentp'})]
});