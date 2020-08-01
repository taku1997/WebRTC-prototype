import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const RadioInput = (props) => {

  return (
    <FormControl component="fieldset" margin="dense">
      <FormLabel component="legend">Role</FormLabel>
      <RadioGroup aria-label="role" name="role" value={props.value} onChange={props.onChange}>
        <FormControlLabel value="トレーナー" control={<Radio />} label="トレーナー" />
        <FormControlLabel value="トレー二ー" control={<Radio />} label="トレー二ー" />
      </RadioGroup>
    </FormControl>
  );
};

export default RadioInput;
