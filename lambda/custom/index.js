/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const Twitter = require('twitter')

const twitter = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.OAUTH_TOKEN,
    access_token_secret: process.env.OAUTH_TOKEN_SECRET
});

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = '医者が教わらない健康、医療情報にようこそ!情報ツイートを読み上げますか？';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('健康情報ツイート', speechText)
      .getResponse();
  },
};

const TwitterIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.intent.name === 'TwitterIntent';
  },

  async handle(handlerInput) {
    let speechText = '';

    // ここでattributes変数を宣言するのに、なぜかattributesManagerでgetSessionコマンドをうつマネをしないとなぜか下のattributes変数を使用するところでシンタックスエラー
    let attributes = await handlerInput.attributesManager.getSessionAttributes();
    attributes.callAmount = 0;

    const tweets = await twitter.get('statuses/user_timeline', {screen_name: "AtomYah"})

    if(tweets && tweets.length > 0) {
      speechText = tweets[0].text;
      attributes.callAmount += 1;
      await handlerInput.attributesManager.setSessionAttributes(attributes);
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('健康情報ツイート', speechText)
      .getResponse();
  },
};



const NextTwitterIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.intent.name === 'NextTwitterIntent';
  },

  async handle(handlerInput) {
    let speechText = '';
    const tweets = await twitter.get('statuses/user_timeline', {screen_name: "AtomYah"})
    const attributes = await handlerInput.attributesManager.getSessionAttributes();
    let num = attributes.callAmount;

    if(tweets && tweets.length > 0) {
      speechText = tweets[num].text;
      attributes.callAmount += 1;
      await handlerInput.attributesManager.setSessionAttributes(attributes);
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('健康情報ツイート', speechText)
      .getResponse();
  },
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'ではまた!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('ごめんなさい、もう一度言ってください')
      .reprompt('ごめんなさい、もう一度言ってください')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    TwitterIntentHandler,
    NextTwitterIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
