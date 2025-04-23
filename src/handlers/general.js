import d3 from "../d3.js"

export function manualZoom({amount, svg, transition_time=500}) {
  const zoom = svg.__zoomObj
  d3.select(svg).transition().duration(transition_time || 0).delay(transition_time ? 100 : 0)  // delay 100 because of weird error of undefined something in d3 zoom
    .call(zoom.scaleBy, amount)
}

export function isAllRelativeDisplayed(d, data) {
  // 检查d和d.data是否存在
  if (!d || !d.data || !d.data.rels) return false
  const r = d.data.rels;
  const all_rels = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(v => v)
  // 确保data数组存在且非空
  if (!data || !Array.isArray(data)) return false
  return all_rels.every((rel_id) =>  {
    return data.some((d) => {
      if (!d.data) return false;
      return d.data.id === rel_id;
    });
  });
}