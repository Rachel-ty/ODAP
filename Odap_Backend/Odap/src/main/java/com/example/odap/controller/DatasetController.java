package com.example.odap.controller;

import com.example.odap.entity.*;
import com.example.odap.repository.DatasetRepository;
import com.example.odap.repository.PictureDataRepository;
import com.example.odap.repository.TextDataRepository;
import com.example.odap.repository.VoiceDataRepository;
import com.example.odap.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.odap.response.DatasetResponse;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class DatasetController {

    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    private PictureDataRepository pictureDataRepository;

    @Autowired
    private VoiceDataRepository voiceDataRepository;

    @Autowired
    private TextDataRepository textDataRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private String uploadDir;

    @CrossOrigin
    @GetMapping("/count_datasets")
    public ResponseEntity<Map<String, Object>> getDatasetCount() {
        long count = datasetRepository.count();

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", count);

        return ResponseEntity.ok(response);
    }


    @CrossOrigin
    @PostMapping("/dataset")
    public ResponseEntity<Map<String, Object>> createDataset(
            HttpServletRequest httpRequest,
            @RequestParam String desc,
            @RequestParam String sample_type,
            @RequestParam String tag_type,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (!(sample_type.equals("audio") || sample_type.equals("picture") || sample_type.equals("text"))) {
            Map<String, Object> response = new HashMap<>();
            response.put("error_msg", "Only support voice, picture or text data");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // save file to the give path
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // generate a unique file name
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        File serverFile = new File(dir.getAbsolutePath() + File.separator + fileName);

        // save
        try (OutputStream os = Files.newOutputStream(serverFile.toPath())) {
            os.write(file.getBytes());
        }

        // create a record and save to database
        Dataset dataset = new Dataset();
        dataset.setDatasetName(file.getOriginalFilename());
        long id = userService.getCurrentUserId(httpRequest);
        dataset.setPublisherId(id);
        LocalDateTime pubTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String pubTimeStr = pubTime.format(formatter);
        dataset.setPubTime(pubTimeStr);
        dataset.setDescription(desc);

        double sizeInBytes = file.getSize();
        double sizeInMB = sizeInBytes / (1024 * 1024);
        // round
        sizeInMB = (double) Math.round(sizeInMB * 100) / 100;

        dataset.setSampleSize(sizeInMB);
        dataset.setSampleType(sample_type);
        dataset.setTagType(tag_type);
        dataset.setFilePath(serverFile.getAbsolutePath());

        datasetRepository.save(dataset);
        DatasetResponse datasetResponse = new DatasetResponse(dataset);

        // deal with different format of data
        if(sample_type.equals("text")) {  // text format process
            String filePath = serverFile.getAbsolutePath();
            try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
                String line;
                ObjectMapper mapper = new ObjectMapper();
                while ((line = reader.readLine()) != null) {
                    // analyse every line of a jsonline file
                    String jsonObject = mapper.readValue(line, Object.class).toString();
                    System.out.println(jsonObject);
                    TextData textData = new TextData(dataset.getId(), jsonObject);
                    textDataRepository.save(textData);
                }
            }
        }
        else { // pic or voice data
            // unzip and save
            String unzipDirPath = dir.getAbsolutePath() + File.separator + "unzip" + File.separator + fileName;
            File unzipDir = new File(unzipDirPath);
            if (!unzipDir.exists()) {
                unzipDir.mkdirs();
            }

            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(serverFile))) {
                ZipEntry zipEntry = zis.getNextEntry();
                while (zipEntry != null) {
                    String fName=zipEntry.getName();
                    if (fName.endsWith(".DS_Store")){  // macos problem
                        zipEntry=zis.getNextEntry();
                        continue;
                    }
                    File newFile = newFile(unzipDir, zipEntry);
                    if(!zipEntry.isDirectory()) {
                        try (FileOutputStream fos = new FileOutputStream(newFile)) {
                            byte[] buffer = new byte[1024];
                            int len;
                            while ((len = zis.read(buffer)) > 0) {
                                fos.write(buffer, 0, len);
                            }
                        }
                        if (sample_type.equals("picture")) {
                            if (newFile.getName().charAt(0) == '.') {  // macos problem
                                zipEntry = zis.getNextEntry();
                                continue;
                            }
                            PictureData pictureData = new PictureData(dataset.getId(), newFile.getName(), newFile.getAbsolutePath());
                            pictureDataRepository.save(pictureData);
                        } else {  // otherwise, sample should be voice
                            VoiceData voiceData = new VoiceData(dataset.getId(), newFile.getName(), newFile.getAbsolutePath());
                            voiceDataRepository.save(voiceData);
                        }
                    }
                    zipEntry = zis.getNextEntry();
                }
                zis.closeEntry();
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", datasetResponse);
        return ResponseEntity.ok(response);
    }

    @CrossOrigin
    @GetMapping("/datasets")
    public ResponseEntity<Map<String, Object>> getDatasets(
            @RequestParam("page_num") int pageNum,
            @RequestParam("page_size") int pageSize,
            @RequestParam(value = "publisher_id", required = false) Long publisherId
    ) {
        // Create page request
        PageRequest pageRequest = PageRequest.of(pageNum - 1, pageSize);

        Page<Dataset> datasetPage;
        if (publisherId != null) {
            datasetPage = datasetRepository.findByPublisherId(publisherId, pageRequest);
        } else {
            datasetPage = datasetRepository.findAll(pageRequest);
        }

        List<Dataset> datasets = datasetPage.getContent();
        // convert datasets to dataset responses
        List<DatasetResponse> datasetResponses = new ArrayList<>();
        for (Dataset dataset : datasets) {
            datasetResponses.add(new DatasetResponse(dataset));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", datasetResponses);

        return ResponseEntity.ok(response);
    }

    @CrossOrigin
    @PutMapping("/dataset/{id}")
    public ResponseEntity<Map<String, Object>> updateDataset(@PathVariable("id") String id, @RequestParam String desc,
                                                             @RequestParam String sample_type, @RequestParam String tag_type,
                                                             @RequestParam("file") MultipartFile file) throws IOException {
        Dataset dataset = datasetRepository.findById(Long.valueOf(id));
        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        // delete existing file in the path
        File oldFile = new File(dataset.getFilePath());
        if (oldFile.exists()) {
            oldFile.delete();
        }

        // save uploaded file

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        File serverFile = new File(dir.getAbsolutePath() + File.separator + fileName);

        try (OutputStream os = Files.newOutputStream(serverFile.toPath())) {
            os.write(file.getBytes());
        }

        dataset.setDescription(desc);
        dataset.setSampleType(sample_type);
        dataset.setTagType(tag_type);
        dataset.setFilePath(serverFile.getAbsolutePath());

        double sizeInBytes = file.getSize();
        double sizeInMB = sizeInBytes / (1024 * 1024);
        sizeInMB = (double) Math.round(sizeInMB * 100) / 100;
        dataset.setSampleSize(sizeInMB);

        Dataset updatedDataset = datasetRepository.save(dataset);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", new DatasetResponse(updatedDataset));

        return ResponseEntity.ok(response);
    }

    @CrossOrigin
    @GetMapping ("/del_dataset/{id}")
    public ResponseEntity<Map<String, Object>> deleteDataset(HttpServletRequest request, @PathVariable("id") String id) {
        Dataset dataset = datasetRepository.findById(Long.valueOf(id));
        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        if(!user.getUserName().equals("root")){ // check if user is root
            Map<String, Object> response = new HashMap<>();
            response.put("code", 405);
            response.put("error_msg", "Only root members can delete dataset!");
            return ResponseEntity.ok(response);
        }
        // 删除数据集
        assert dataset != null;
        File oldFile = new File(dataset.getFilePath());
        if (oldFile.exists()) {
            oldFile.delete();
        }
        datasetRepository.delete(dataset);

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", null);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dataset/{id}")
    public ResponseEntity<Map<String, Object>> getDataset(@PathVariable("id") String id) {
        Dataset dataset = datasetRepository.findById(Long.valueOf(id));
        if (dataset == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("error_msg", "success");
        response.put("data", new DatasetResponse(dataset));

        return ResponseEntity.ok(response);
    }


    public File newFile(File destinationDir, ZipEntry zipEntry) throws IOException {
        File destFile = new File(destinationDir, zipEntry.getName());

        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();

        if (!destFilePath.startsWith(destDirPath + File.separator)) {
            throw new IOException("Entry is outside of the target dir: " + zipEntry.getName());
        }
        if (zipEntry.isDirectory()) {
            destFile.mkdirs();
        } else {
            destFile.getParentFile().mkdirs();
        }
        return destFile;
    }
}


