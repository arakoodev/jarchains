package com.edgechain.lib.flyfly.commands.jbang;

import java.io.*;
import java.util.HashMap;

import com.jezhumble.javasysmon.JavaSysMon;
import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;
import picocli.CommandLine.Parameters;

@Component
@Command(
    name = "jbang",
    description =
        "Activate jbang through the jar placed in resources. Ignore if your application is executed.")
public class JbangCommand implements Runnable {

  @Parameters(description = "Java file to be executed with jbang")
  private String javaFile;

  //  @Parameters(description = "ClassPath Jar to be used")
  //  private String classPathJar;

  private final JavaSysMon sysMon = new JavaSysMon();

  @Override
  public void run() {
    String resourcePath = "/jbang.jar";
    try {
      File jarFile = extractFileFromResources(resourcePath);
      if (jarFile != null) {
        runJbang(jarFile, javaFile, System.getProperty("jar.name"));
      } else {
        System.out.println("Could not find jbang.jar in resources.");
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private File extractFileFromResources(String resourcePath) throws IOException {
    InputStream inputStream = getClass().getResourceAsStream(resourcePath);
    if (inputStream == null) {
      return null;
    }
    File jarFile = File.createTempFile("jbang", ".jar");
    jarFile.deleteOnExit();
    try (FileOutputStream outputStream = new FileOutputStream(jarFile)) {
      inputStream.transferTo(outputStream);
    }
    return jarFile;
  }

  private void runJbang(File jarFile, String javaFile, String classPathJar) {

    try {
      // Step One: Execute the initial command to get the classpath
      ProcessBuilder pb =
          new ProcessBuilder(
              "java",
              "-cp",
              jarFile.getAbsolutePath(),
              "dev.jbang.Main",
              "--cp",
              classPathJar,
              javaFile);
      pb.redirectErrorStream(true);
      Process process = pb.start();

      InputStreamReader inputStreamReader = new InputStreamReader(process.getInputStream());

      BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

      String classPath = extractClassPathFromOutput(bufferedReader);
      String mainClass;

      String[] filePath;

      String platformName = System.getProperty("os.name");
      if (platformName.contains("Windows")) {
        filePath = classPath.split(";");
      } else {
        filePath = classPath.split(":");
      }

      File file = new File(filePath[0]);
      String filename = file.getName().split("\\.")[0];
      mainClass = String.format("com.edgechain.%s", filename);

      System.out.println("Extracted Filename: " + filename);
      System.out.println("Main Class: " + mainClass);

      process.waitFor();

      // Step Two: Execute the final command with the extracted classpath
      if (!classPath.isEmpty() && mainClass != null && !mainClass.isEmpty()) {
        runJavaWithClassPath(classPath, mainClass);
      } else {
        System.out.println("Could not extract classpath or main class from the output.");
      }

    } catch (IOException | InterruptedException e) {
      e.printStackTrace();
    }
  }

  private String extractClassPathFromOutput(BufferedReader bufferedReader) throws IOException {
    String line;
    HashMap<String, String> sepMap = new HashMap<String, String>();
    HashMap<String, String> cpPatternMap = new HashMap<String, String>();
    HashMap<String, String> cpEndPatternMap = new HashMap<String, String>();

    sepMap.put("Linux", "/");
    sepMap.put("Windows", "\\");

    cpPatternMap.put("Linux", "-classpath ");
    cpPatternMap.put("Windows", "-classpath '");

    cpEndPatternMap.put("Linux", " ");
    cpEndPatternMap.put("Windows", "\'");

    String classPath = null;
    String platformName = System.getProperty("os.name");
    if (platformName.contains("Windows")) {
      platformName = "Windows";
    } else {
      // Mac and Linux have the same representations.
      platformName = "Linux";
    }
    final String pattern = cpPatternMap.get(platformName);
    while ((line = bufferedReader.readLine()) != null) {
      int startIndex = line.indexOf(pattern);
      if (startIndex > -1) {
        startIndex += pattern.length();
        int endIndex = line.indexOf(cpEndPatternMap.get(platformName).charAt(0), startIndex);
        if (endIndex > startIndex) {
          classPath = line.substring(startIndex, endIndex);
          break;
        }
      }
    }

    System.out.println("Extracted ClassPath = " + classPath);
    return classPath;
  }

  private void runJavaWithClassPath(String classPath, String mainClass) {
    try {
      ProcessBuilder pb = new ProcessBuilder("java", "-classpath", classPath, mainClass);
      pb.inheritIO();
      pb.start();

      sysMon.killProcess(sysMon.currentPid());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
