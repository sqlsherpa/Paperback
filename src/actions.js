function getRotationAction(speed) {
  return {
    start: function(entity) {},
    update: function(entity, updateData) {
      console.log(updateData.time);
      entity.transform = transformMatMat(
        entity.transform,
        getRotation(new vec3(0, 0, 1), updateData.dt * 2 * Math.PI * speed)
      );
    }
  };
}
