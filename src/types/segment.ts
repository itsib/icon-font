export type SegmentM = ['M', number, number];
export type SegmentV = ['V', number];
export type SegmentH = ['H', number];
export type SegmentL = ['L', number, number];
export type SegmentS = ['S', number, number, number, number];
export type SegmentQ = ['Q', number, number, number, number];
export type SegmentC = ['C', number, number, number, number, number, number];
export type SegmentZ = ['Z'];

export type Segment = SegmentM | SegmentQ | SegmentC | SegmentV | SegmentH | SegmentZ | SegmentL | SegmentS;