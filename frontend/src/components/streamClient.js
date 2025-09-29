// streamClient.js
import { StreamVideoClient } from '@stream-io/video-react-sdk';


const apiKey = "mmhfdzb5evj2";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0Fic3RyYWN0ZWRfU3BlY3Ryb3Njb3BlIiwidXNlcl9pZCI6IkFic3RyYWN0ZWRfU3BlY3Ryb3Njb3BlIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NTkxMTA4ODcsImV4cCI6MTc1OTcxNTY4N30.m7-llLGYa1krhkbXMp3pXwIsaHWh7VytuO77xmWZJh0";
const userId = "Abstracted_Spectroscope";

export const client = new StreamVideoClient({
  apiKey: apiKey,
  user: { id: 'Abstracted_Spectroscope', name: 'Tutorial' },
  token: token,
});
