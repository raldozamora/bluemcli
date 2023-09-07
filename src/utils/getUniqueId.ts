import hyperid from 'hyperid';

const instance = hyperid({urlSafe: true});

export default function getUniqueId() {
  return instance().replace(/-/g, '').replace(/_/g, '');
}
