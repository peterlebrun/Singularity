import * as TaskActions from '../../actions/api/task';
import Utils from '../../utils';

const initialState = {};

export default function task(state = initialState, action) {
  let newData = {};
  switch (action.type) {
    case TaskActions.FETCH_TASK_CLEAR:
      return initialState;

    case TaskActions.FETCH_TASK_ERROR:
      newData[action.taskId] = {
        isFetching: false,
        error: action.error
      };
      if (state[action.taskId]) {
        newData[action.taskId] = _.extend(state[action.taskId], newData[action.taskId]);
      }
      return _.extend({}, state, newData);

    case TaskActions.FETCH_TASK_SUCCESS:
      newData[action.taskId] = {
        isFetching: false,
        error: null,
        receivedAt: Date.now(),
        data: action.data
      };

      newData[action.taskId].data.lastKnownState = _.last(newData[action.taskId].data.taskUpdates);
      let isStillRunning = true;
      if (newData[action.taskId].data.taskUpdates && _.contains(Utils.TERMINAL_TASK_STATES, newData[action.taskId].data.lastKnownState.taskState)) {
        isStillRunning = false;
      }
      newData[action.taskId].data.isStillRunning = isStillRunning;

      newData[action.taskId].data.isCleaning = newData[action.taskId].data.lastKnownState.taskState == 'TASK_CLEANING';

      let ports = [];
      if (newData[action.taskId].data.task.taskRequest.deploy.resources.numPorts > 0) {
        for (let resource of newData[action.taskId].data.task.mesosTask.resources) {
          if (resource.name == 'ports') {
            for (let range of resource.ranges.range) {
              for (let port of Utils.range(range.begin, range.end + 1)) {
                ports.push (port);
              }
            }
          }
        }
      }
      newData[action.taskId].data.ports = ports;

      if (state[action.taskId]) {
        newData[action.taskId] = _.extend(state[action.taskId], newData[action.taskId]);
      }
      return _.extend({}, state, newData);

    case TaskActions.FETCH_TASK_STARTED:
      // Request initiated
      newData[action.taskId] = {
        isFetching: true,
        error: null
      };
      if (state[action.taskId]) {
        newData[action.taskId] = _.extend(state[action.taskId], newData[action.taskId]);
      }
      return _.extend({}, state, newData);

    default:
      return state;
  }
}
