module.exports = function layoutToMapping(layout) {
  const map = {};

  layout.groups.forEach(group => {
    group.columns.forEach(col => {
      map[col.key] = {
        label: col.label,
        source: col.source,
        calculate: col.calculate,
        round: 2
      };
    });
  });

  return map;
};
