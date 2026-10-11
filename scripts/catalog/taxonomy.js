export const CANONICAL_TOPICS = {
  'algorithms': {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Observe sorting steps, pathfinding waves, dynamic programming, and complexity in action.',
  },
  'machine-learning': {
    id: 'machine-learning',
    title: 'Machine Learning',
    description: 'Explore neural foundations, linear classifiers, gradient optimization, and decision spaces.',
  },
  'data-structures': {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Traverse, balance, and inspect hierarchical and linear structures in real-time.',
  },
  'computer-systems': {
    id: 'computer-systems',
    title: 'Computer Systems',
    description: 'Simulate CPU process scheduling algorithms, virtual memory paging, and cache hierarchies.',
  },
  'networking': {
    id: 'networking',
    title: 'Computer Networks',
    description: 'Trace packet routing, TCP flow control, handshake sequences, and subnet topologies.',
  },
};

export const CANONICAL_TOPIC_IDS = Object.keys(CANONICAL_TOPICS);

export function isValidTopicId(id) {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(CANONICAL_TOPICS, id);
}

export function getCanonicalTopic(id) {
  return isValidTopicId(id) ? CANONICAL_TOPICS[id] : undefined;
}

export function getCanonicalTopicTitle(id) {
  const topic = getCanonicalTopic(id);
  return topic ? topic.title : undefined;
}
