import '../styles/tutorial';
import React from 'react';

export default class Tutorial extends React.Component {
  isMapEmpty(map) {
    return (Object.keys(map).length === 0);
  }

  remainingReqs(reqs) {
    let remaining = {};
    if (!reqs) {
      return remaining;
    }

    for (let req in reqs) {
      if (req && (reqs[req] > 0)) {
        const resource = this.props.resourceManager.getResource(req);
        if (resource && (resource.count < reqs[req])) {
          remaining[req] = reqs[req] - resource.count;
        }
      }
    }

    return remaining;
  }

  setStep(nextStep) {
    const tutorial = this.props.resourceManager.tutorial;
    const curStep = tutorial.step || 0;
    const step = tutorial.steps[curStep];

    if (nextStep !== undefined) {
      tutorial.step = nextStep;

    } else if (step) {
      tutorial.step = curStep + 1;

      for (let prize in (step.prize || {})) {
        const resource = this.props.resourceManager.getResource(prize);
        if (resource) {
          resource.count += step.prize[prize] ;
        }
      }
    }

    this.props.onUpdate();
  }

  renderNumber(value, remaining) {
    const num = (value || 0)
    const rem = (remaining || 0);
    return <span className={(rem > 0) ? 'negative' : 'positive'}>
      {(num - rem).toFixed()} / {num.toFixed()}
    </span>;
  }

  render() {
    const tutorial = this.props.resourceManager.tutorial;
    if (!tutorial || !tutorial.steps) {
      return null;
    }

    const step = tutorial.steps[tutorial.step || 0];
    if (!step) {
      return <div id='tutorial' className='right'>
        <button onClick={_ => this.setStep(0)}>Restart Tutorial</button>
      </div>;
    }

    if (!this.isMapEmpty(this.remainingReqs(step.pre))) {
      return null;
    }

    const post = step.post || {};
    const remaining = this.remainingReqs(post);

    return <div id='tutorial' className='bundle'>
      <div className='name'>Tutorial</div>
      <div className='text' dangerouslySetInnerHTML={{__html: step.text || ''}} />
      {Object.keys(post).map((req, i) =>
        <div className='requirement'>{(i > 0) ? ' , ' : ''}{req}: {this.renderNumber(post[req], remaining[req])}</div>
      )}
      <button onClick={_ => this.setStep()} disabled={!this.isMapEmpty(remaining)}>
        {step.button || 'Continue'}
      </button>
      {step.prize && !this.isMapEmpty(step.prize) && Object.keys(step.prize).map((res, i) =>
        <div className='requirement'>
          {(i > 0) ? ' , ' : 'Upon completion, rewards '}{step.prize[res]} {res}
        </div>
      )}
    </div>;
  }
}