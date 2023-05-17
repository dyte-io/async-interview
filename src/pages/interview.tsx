import {
  DyteAudioVisualizer,
  DyteAvatar,
  DyteParticipantTile,
  DyteSpinner,
} from '@dytesdk/react-ui-kit';
import {
  DyteProvider,
  useDyteClient,
  useDyteMeeting,
  useDyteSelector,
} from '@dytesdk/react-web-core';
import { useEffect, useRef, useState } from 'react';

const questions = [
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075287/Intro_xb5ftf.mp4',
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075215/Question_1_rwml32.mp4',
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075219/Question_2_yeddjq.mp4',
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075219/Question_3_kqgbgw.mp4',
];

function Interview() {
  const $video = useRef<HTMLVideoElement>(null);
  const roomJoined = useDyteSelector((m) => m.self.roomJoined);
  const [stage, setStage] = useState(0);
  const { meeting } = useDyteMeeting();

  const recordingState = useDyteSelector((m) => m.recording.recordingState);

  if (!roomJoined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full w-full">
      {stage < questions.length && (
        <aside className="relative flex-1">
          <video
            className="h-full w-full object-cover"
            src={questions[stage]}
            ref={$video}
            controls
            autoPlay
          />
        </aside>
      )}
      <main className="flex flex-1 flex-col items-center justify-center gap-12 p-4">
        {stage > 0 && stage < questions.length && (
          <>
            <p className="text-lg font-bold">
              Question {stage} of {questions.length - 1}
            </p>

            <DyteParticipantTile
              participant={meeting.self}
              className="relative aspect-[4/3] h-auto w-full max-w-[540px]"
            >
              <DyteAudioVisualizer
                participant={meeting.self}
                size="lg"
                className="absolute right-3 top-3"
              />
              <DyteAvatar participant={meeting.self} />
            </DyteParticipantTile>
          </>
        )}

        {stage > 0 &&
          stage < questions.length &&
          recordingState === 'STARTING' && (
            <p className="info">
              <DyteSpinner />
              Starting the recording...
            </p>
          )}

        {stage > 0 &&
          stage < questions.length &&
          recordingState === 'STOPPING' && (
            <p className="info">
              <DyteSpinner />
              Stopping the recording...
            </p>
          )}

        {stage > 0 && recordingState === 'RECORDING' && (
          <p className="info border-red-500 text-red-700">
            Recording has started, you can start speaking now
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {stage > 0 &&
            stage < questions.length &&
            recordingState === 'IDLE' && (
              <button
                className="btn bg-red-500"
                onClick={() => {
                  $video.current?.pause();
                  meeting.recording.start();
                }}
              >
                Start Recording My Answer
              </button>
            )}

          {stage === 0 && (
            <button
              className="btn"
              onClick={() => {
                setStage(1);
              }}
            >
              Awesome, I&apos;m ready 🚀
            </button>
          )}

          {stage > 0 && stage < questions.length - 1 && (
            <button
              className="btn"
              onClick={async () => {
                if (recordingState === 'RECORDING') {
                  await meeting.recording.stop();
                  setStage((stage) => stage + 1);
                }
              }}
              disabled={recordingState !== 'RECORDING'}
            >
              Next
            </button>
          )}

          {stage === questions.length - 1 && (
            <button
              className="btn"
              onClick={() => {
                if (recordingState === 'RECORDING') {
                  meeting.recording.stop();
                }
                setStage(questions.length);
              }}
            >
              Finish
            </button>
          )}

          {stage === questions.length && (
            <div>
              <p className="max-w-md text-center text-2xl font-semibold">
                Thank you for attending the interview. Your responses were
                recorded.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function InterviewPage() {
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);

    const authToken = search.get('token');

    if (!authToken) {
      return alert('authToken was not passed');
    }

    initMeeting({
      authToken,
    }).then((m) => m?.joinRoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log({ initMeeting });
  }, [initMeeting]);

  return (
    <DyteProvider value={meeting} fallback={<div>Loading...</div>}>
      <Interview />
    </DyteProvider>
  );
}
