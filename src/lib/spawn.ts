import spawn_ from 'cross-spawn';

export default function spawn(
  command: string,
  args: string[],
  options: any
): Promise<any> {
  return new Promise((resolve, reject) =>
    spawn_(command, args, options).on('exit', resolve).on('error', reject)
  );
}
