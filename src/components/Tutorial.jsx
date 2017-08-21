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

  nextStep(step) {
    this.props.resourceManager.tutorial.step = step + 1;
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
    if (!step || !this.isMapEmpty(this.remainingReqs(step.pre))) {
      return null;
    }

    const post = step.post || {};
    const remaining = this.remainingReqs(post);

    return <div id='tutorial' className='bundle'>
      <div className='text' dangerouslySetInnerHTML={{__html: step.text || ''}} />
      {Object.keys(post).map((req, i) =>
        <div className='requirement'>{(i > 0) ? ' , ' : ''}{req}: {this.renderNumber(post[req], remaining[req])}</div>
      )}
      <button onClick={_ => this.nextStep(tutorial.step || 0)} disabled={!this.isMapEmpty(remaining)}>
        {step.button || 'Continue'}
      </button>
    </div>;
  }
}