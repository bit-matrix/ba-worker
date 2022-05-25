const onlyUnique = (value: Array<any>, index: number, self: any) => {
  return self.indexOf(value) === index;
};

export const isUniqueArray = (array: Array<any>): boolean => {
  var uniqueArray = array.filter(onlyUnique);

  return array.length === uniqueArray.length;
};

export const div = (input1: number, input2: number) => Math.floor(input1 / input2);
